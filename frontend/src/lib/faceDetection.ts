"use client";

import { FaceDetection } from '@mediapipe/face_detection';

// Singleton instance
let faceDetectorPromise: Promise<FaceDetection> | null = null;

/**
 * Initializes and loads the MediaPipe FaceDetection model once.
 */
async function getFaceDetector(): Promise<FaceDetection> {
  if (typeof window === "undefined") {
    throw new Error("MediaPipe cannot be loaded in SSR environment");
  }

  if (!faceDetectorPromise) {
    faceDetectorPromise = new Promise(async (resolve, reject) => {
      try {
        const detector = new FaceDetection({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        });
        
        await detector.setOptions({
          model: 'short', // short-range, faster (0)
          minDetectionConfidence: 0.5,
        });
        
        await detector.initialize();
        resolve(detector);
      } catch (error) {
        reject(error);
      }
    });
  }

  return faceDetectorPromise;
}

/** Helper: Load a File into an HTMLImageElement */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Detects if at least one face is present in the image using MediaPipe.
 * P95 execution must be < 400ms. Fails open (returns true) if detection fails or times out.
 */
export async function detectFace(file: File): Promise<boolean> {
  if (typeof window === "undefined") return true;

  try {
    const img = await loadImage(file);
    
    // Timeout wrapper for < 400ms constraint
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error("Face detection timeout")), 400);
    });

    const detectionPromise = async (): Promise<boolean> => {
      const detector = await getFaceDetector();
      let hasFace = false;
      
      // Wait for a single result
      return new Promise<boolean>((resolve) => {
        const onResults = (results: { detections: unknown[] }) => {
          detector.onResults(() => {}); // cleanup listener
          hasFace = results.detections && results.detections.length > 0;
          resolve(hasFace);
        };
        
        detector.onResults(onResults);
        detector.send({ image: img }).catch(() => resolve(true)); // Fail open on send error
      });
    };

    return await Promise.race([detectionPromise(), timeoutPromise]);
  } catch (error) {
    console.warn("[SkinWISE] Face detection failed or timed out, failing open:", error);
    return true; // fail open
  }
}
