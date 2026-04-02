import io
import time
import numpy as np
import onnxruntime as ort
import cv2
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI(title="SkinWISE Inference Worker", version="1.0")

# Load ONNX session globally on startup. NEVER load this per-request.
# Path assumes the worker is run from the `backend/inference_worker` directory.
MODEL_PATH = "../../models/best.onnx"
try:
    # CPU execution provider. Swap to 'CUDAExecutionProvider' later if GPU is available.
    SESSION = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
    INPUT_NAME = SESSION.get_inputs()[0].name
except Exception as e:
    print(f"CRITICAL: Failed to load ONNX model at {MODEL_PATH}. Error: {e}")
    SESSION = None

# PSD Thresholds
CONF_THRESH = 0.45
IOU_THRESH = 0.45

def letterbox_image(image: Image.Image, target_size: tuple) -> tuple:
    """
    Resizes image with an unmodified aspect ratio using padding (letterboxing).
    YOLOv8 requires this specific preprocessing to prevent spatial distortion.
    """
    iw, ih = image.size
    w, h = target_size
    scale = min(w/iw, h/ih)
    nw = int(iw * scale)
    nh = int(ih * scale)

    image = image.resize((nw, nh), Image.Resampling.LANCZOS)
    new_image = Image.new('RGB', target_size, (114, 114, 114)) # Standard YOLO padding color
    new_image.paste(image, ((w - nw) // 2, (h - nh) // 2))
    
    # Return padded image and the padding metadata to adjust bounding boxes later
    dw = (w - nw) / 2
    dh = (h - nh) / 2
    return new_image, scale, dw, dh

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if SESSION is None:
        raise HTTPException(status_code=500, detail="ONNX Model not loaded.")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Image required.")

    start_time = time.perf_counter()
    
    # 1. Read and Preprocess
    image_bytes = await file.read()
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupted image file.")
        
    orig_w, orig_h = img.size
    padded_img, scale, dw, dh = letterbox_image(img, (640, 640))
    
    # Convert to NumPy, normalize, and format to [1, 3, 640, 640]
    img_data = np.array(padded_img, dtype=np.float32) / 255.0
    img_data = np.transpose(img_data, (2, 0, 1))
    img_data = np.expand_dims(img_data, axis=0)

    # 2. Run Inference
    outputs = SESSION.run(None, {INPUT_NAME: img_data})
    output_tensor = outputs[0]  # Shape: [1, 4 + num_classes, 8400]
    
    # 3. Post-Process (NMS & Coordinate Mapping)
    predictions = np.squeeze(output_tensor).T  # Shape: [8400, 4 + num_classes]
    
    boxes = []
    scores = []
    class_ids = []

    for row in predictions:
        # row[0:4] = [x_center, y_center, width, height]
        # row[4:] = class probabilities
        class_probs = row[4:]
        class_id = np.argmax(class_probs)
        max_prob = class_probs[class_id]
        
        if max_prob > CONF_THRESH:
            xc, yc, w, h = row[0:4]
            # Convert letterboxed coordinates back to original image scale
            xc = (xc - dw) / scale
            yc = (yc - dh) / scale
            w = w / scale
            h = h / scale
            
            x1 = xc - (w / 2)
            y1 = yc - (h / 2)
            
            boxes.append([x1, y1, w, h]) # cv2.dnn.NMSBoxes expects [x, y, w, h]
            scores.append(float(max_prob))
            class_ids.append(int(class_id))

    # Apply Non-Maximum Suppression (NMS) to remove duplicate overlapping boxes
    indices = cv2.dnn.NMSBoxes(boxes, scores, CONF_THRESH, IOU_THRESH)
    
    detections = []
    if len(indices) > 0:
        for i in indices.flatten():
            x, y, w, h = boxes[i]
            # Normalize coordinates to [0, 1] relative to original image as per PSD
            det = {
                "class_id": class_ids[i],
                "bbox_x": round(max(0, x + (w/2)) / orig_w, 4), # Center X
                "bbox_y": round(max(0, y + (h/2)) / orig_h, 4), # Center Y
                "bbox_w": round(min(orig_w, w) / orig_w, 4),
                "bbox_h": round(min(orig_h, h) / orig_h, 4),
                "confidence": round(scores[i], 4),
                "low_conf": scores[i] < 0.60
            }
            detections.append(det)

    inference_ms = int((time.perf_counter() - start_time) * 1000)

    return JSONResponse({
        "status": "success",
        "inference_ms": inference_ms,
        "total_detections": len(detections),
        "detections": detections
    })