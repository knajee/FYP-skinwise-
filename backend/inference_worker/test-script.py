import requests
import sys
from PIL import Image, ImageDraw

# Adjust this to the exact path of the image on your desktop
IMAGE_PATH = r"C:\Users\EliteBook\Downloads\test1.jfif"
API_URL = "http://localhost:8001/predict"

def test_inference():
    print(f"🚀 Sending {IMAGE_PATH} to Inference Worker...")
    
    try:
        with open(IMAGE_PATH, "rb") as f:
            files = {"file": ("test.jpg", f, "image/jpeg")}
            response = requests.post(API_URL, files=files)
    except FileNotFoundError:
        print(f"❌ Error: Cannot find image at {IMAGE_PATH}")
        sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to API. Is Uvicorn running on port 8001?")
        sys.exit(1)

    if response.status_code != 200:
        print(f"❌ API Error {response.status_code}: {response.text}")
        sys.exit(1)

    data = response.json()
    
    print("\n✅ API Response Received!")
    print(f"⏱️  Inference Time : {data['inference_ms']} ms")
    print(f"🎯 Total Detections: {data['total_detections']}")
    
    if data['total_detections'] == 0:
        print("No lesions detected. Try an image with more obvious acne.")
        return

    # Visual Validation: Prove the coordinate math is correct
    print("\n🖌️ Drawing bounding boxes to verify coordinate translation...")
    img = Image.open(IMAGE_PATH)
    draw = ImageDraw.Draw(img)
    orig_w, orig_h = img.size

    for i, det in enumerate(data['detections']):
        # Convert normalized [0, 1] coordinates back to absolute pixels
        cx = det['bbox_x'] * orig_w
        cy = det['bbox_y'] * orig_h
        w = det['bbox_w'] * orig_w
        h = det['bbox_h'] * orig_h
        
        x1 = cx - (w / 2)
        y1 = cy - (h / 2)
        x2 = cx + (w / 2)
        y2 = cy + (h / 2)
        
        # Draw red box. Use dashed line logic if low_conf is True
        color = "orange" if det['low_conf'] else "red"
        width = 2 if det['low_conf'] else 4
        
        draw.rectangle([x1, y1, x2, y2], outline=color, width=width)
        draw.text((x1, y1 - 15), f"Conf: {det['confidence']:.2f}", fill=color)

    # Save and show the result
    output_path = "validation_result.jpg"
    img.save(output_path)
    print(f"📸 Saved visual validation to {output_path}")
    img.show()

if __name__ == "__main__":
    test_inference()