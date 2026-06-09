"use client";

/**
 * Image Quality utility functions for SkinWISE 2.0.
 * Includes blur detection, luminance checking, and resolution verification.
 */

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

/** Helper: Get ImageData from an Image */
function getImageData(img: HTMLImageElement, targetSize = 320, roiOnly = false): ImageData {
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  const isOffscreenSupported = typeof OffscreenCanvas !== "undefined";

  if (isOffscreenSupported) {
    canvas = new OffscreenCanvas(targetSize, targetSize);
  } else {
    canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
  }

  const ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  if (!ctx) throw new Error("Could not get 2D context");

  if (roiOnly) {
    // Draw the center 50% of the image (Region of Interest)
    const srcWidth = img.naturalWidth;
    const srcHeight = img.naturalHeight;
    const roiSize = Math.min(srcWidth, srcHeight) * 0.5;
    const srcX = (srcWidth - roiSize) / 2;
    const srcY = (srcHeight - roiSize) / 2;

    ctx.drawImage(img, srcX, srcY, roiSize, roiSize, 0, 0, targetSize, targetSize);
  } else {
    // Draw scaled down image
    ctx.drawImage(img, 0, 0, targetSize, targetSize);
  }

  return ctx.getImageData(0, 0, targetSize, targetSize);
}

/**
 * Computes the variance of the Laplacian of the image.
 * Uses a 3x3 Laplacian kernel to measure blur.
 * Threshold: variance < 100 is blurry.
 */
export async function computeLaplacianVariance(file: File): Promise<number> {
  if (typeof window === "undefined") return 150; // Pass through in SSR

  try {
    const img = await loadImage(file);
    const imageData = getImageData(img, 320, false);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Convert to grayscale
    const gray = new Float32Array(width * height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    const laplacian = new Float32Array(width * height);
    let sum = 0;
    let count = 0;

    // Apply Laplacian kernel [0,1,0, 1,-4,1, 0,1,0]
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        const val =
          gray[i - width] + // top
          gray[i - 1] + // left
          gray[i + 1] + // right
          gray[i + width] - // bottom
          4 * gray[i]; // center

        laplacian[i] = val;
        sum += val;
        count++;
      }
    }

    const mean = sum / count;
    let varianceSum = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const val = laplacian[y * width + x];
        varianceSum += Math.pow(val - mean, 2);
      }
    }

    return varianceSum / count;
  } catch (error) {
    console.warn("[SkinWISE] Laplacian variance calculation failed:", error);
    return 150; // fail open
  }
}

/**
 * Checks the mean luminance of the central 50% of the image.
 * Passes if mean is between 60 and 210.
 */
export async function checkLuminance(file: File): Promise<{ mean: number; passed: boolean; warning: string | null }> {
  if (typeof window === "undefined") return { mean: 120, passed: true, warning: null }; // Pass through in SSR

  try {
    const img = await loadImage(file);
    const imageData = getImageData(img, 320, true);
    const data = imageData.data;

    let sum = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      // Perceived luminance formula
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += luma;
    }

    const mean = sum / pixelCount;
    const passed = mean >= 60 && mean <= 210;
    
    let warning: string | null = null;
    if (mean < 60) {
      warning = "Image appears too dark — try in natural daylight";
    } else if (mean > 210) {
      warning = "Image appears overexposed — reduce direct light";
    }

    return { mean, passed, warning };
  } catch (error) {
    console.warn("[SkinWISE] Luminance calculation failed:", error);
    return { mean: 120, passed: true, warning: null }; // fail open
  }
}

/**
 * Checks if the image meets the minimum resolution requirement (200x200).
 * // TODO: Revert to 480x480 for production deployment.
 */
export async function checkResolution(file: File): Promise<{ width: number; height: number; passed: boolean }> {
  if (typeof window === "undefined") return { width: 1000, height: 1000, passed: true }; // Pass through in SSR

  try {
    const img = await loadImage(file);
    const passed = img.naturalWidth >= 200 && img.naturalHeight >= 200;
    return { width: img.naturalWidth, height: img.naturalHeight, passed };
  } catch (error) {
    console.warn("[SkinWISE] Resolution check failed:", error);
    return { width: 0, height: 0, passed: false };
  }
}
