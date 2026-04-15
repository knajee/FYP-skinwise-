import io
import time
import numpy as np
import onnxruntime as ort
import cv2
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI(title="SkinWISE Inference Worker (SAHI Enabled)", version="1.1")

MODEL_PATH = "../../models/best.onnx"
try:
    SESSION = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
    INPUT_NAME = SESSION.get_inputs()[0].name
except Exception as e:
    print(f"CRITICAL: Failed to load ONNX model. Error: {e}")
    SESSION = None

# Production Thresholds
CONF_THRESH = 0.20
IOU_THRESH = 0.40
SLICE_SIZE = 640
OVERLAP_RATIO = 0.20
MAX_IMAGE_DIM = 1280  # Pre-scale limit to prevent CPU timeout

def get_slice_bboxes(image_w, image_h, slice_size, overlap_ratio):
    """Calculates overlapping grid coordinates for the sliding window."""
    stride = int(slice_size * (1 - overlap_ratio))
    bboxes = []
    
    for y in range(0, image_h, stride):
        for x in range(0, image_w, stride):
            x_min = x
            y_min = y
            x_max = min(x_min + slice_size, image_w)
            y_max = min(y_min + slice_size, image_h)
            
            # If the slice hits the right/bottom edge, shift it back to maintain 640x640
            if x_max - x_min < slice_size:
                x_min = max(0, x_max - slice_size)
            if y_max - y_min < slice_size:
                y_min = max(0, y_max - slice_size)
                
            bbox = (x_min, y_min, x_min + slice_size, y_min + slice_size)
            if bbox not in bboxes:
                bboxes.append(bbox)
                
    return bboxes

def process_slice(slice_img: Image.Image) -> np.ndarray:
    """Formats a 640x640 slice for ONNX ingestion."""
    img_data = np.array(slice_img, dtype=np.float32) / 255.0
    img_data = np.transpose(img_data, (2, 0, 1))
    return np.expand_dims(img_data, axis=0)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if SESSION is None:
        raise HTTPException(status_code=500, detail="ONNX Model not loaded.")

    start_time = time.perf_counter()
    image_bytes = await file.read()
    
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupted image file.")
        
    orig_w, orig_h = img.size
    
    # 1. Pre-scale to prevent inference timeout on massive images
    scale_factor = 1.0
    if max(orig_w, orig_h) > MAX_IMAGE_DIM:
        scale_factor = MAX_IMAGE_DIM / float(max(orig_w, orig_h))
        new_w = int(orig_w * scale_factor)
        new_h = int(orig_h * scale_factor)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    cur_w, cur_h = img.size
    
    # 2. Generate SAHI sliding window coordinates
    slice_coords = get_slice_bboxes(cur_w, cur_h, SLICE_SIZE, OVERLAP_RATIO)
    
    global_boxes = []
    global_scores = []
    global_class_ids = []

    # 3. Process each slice
    for (x_min, y_min, x_max, y_max) in slice_coords:
        slice_img = img.crop((x_min, y_min, x_max, y_max))
        tensor = process_slice(slice_img)
        
        outputs = SESSION.run(None, {INPUT_NAME: tensor})
        predictions = np.squeeze(outputs[0]).T  # [8400, 4 + classes]
        
        for row in predictions:
            class_probs = row[4:]
            class_id = np.argmax(class_probs)
            max_prob = class_probs[class_id]
            
            if max_prob > CONF_THRESH:
                xc, yc, w, h = row[0:4]
                
                # Convert slice-relative coordinates to global image coordinates
                global_xc = xc + x_min
                global_yc = yc + y_min
                
                x1 = global_xc - (w / 2)
                y1 = global_yc - (h / 2)
                
                global_boxes.append([x1, y1, w, h])
                global_scores.append(float(max_prob))
                global_class_ids.append(int(class_id))

    # 4. Global Non-Maximum Suppression to merge overlapping boxes from different slices
    indices = cv2.dnn.NMSBoxes(global_boxes, global_scores, CONF_THRESH, IOU_THRESH)
    
    detections = []
    if len(indices) > 0:
        for i in indices.flatten():
            x, y, w, h = global_boxes[i]
            
            # Revert the pre-scale to map coordinates back to the user's original image
            orig_x = x / scale_factor
            orig_y = y / scale_factor
            orig_w_box = w / scale_factor
            orig_h_box = h / scale_factor
            
            # Normalize to [0, 1] relative to original image
            det = {
                "class_id": global_class_ids[i],
                "bbox_x": round(max(0, orig_x + (orig_w_box/2)) / orig_w, 4),
                "bbox_y": round(max(0, orig_y + (orig_h_box/2)) / orig_h, 4),
                "bbox_w": round(min(orig_w, orig_w_box) / orig_w, 4),
                "bbox_h": round(min(orig_h, orig_h_box) / orig_h, 4),
                "confidence": round(global_scores[i], 4),
                "low_conf": global_scores[i] < 0.60
            }
            detections.append(det)

    inference_ms = int((time.perf_counter() - start_time) * 1000)

    return JSONResponse({
        "status": "success",
        "inference_ms": inference_ms,
        "slices_processed": len(slice_coords),
        "total_detections": len(detections),
        "detections": detections
    })