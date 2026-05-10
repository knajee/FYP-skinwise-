import exifr from 'exifr';

/**
 * Extracts EXIF metadata from an image file.
 * Safely parses DateTimeOriginal, latitude, and longitude.
 * Rounds coordinates to 2 decimal places (±1.1km precision).
 * Never throws — returns nulls on failure.
 */
export async function extractExifData(
  file: File
): Promise<{ capturedAt: string | null; lat: number | null; lng: number | null }> {
  try {
    const output = await exifr.parse(file);

    if (!output) {
      return { capturedAt: null, lat: null, lng: null };
    }

    let capturedAt: string | null = null;
    if (output.DateTimeOriginal) {
      const dt = output.DateTimeOriginal;
      capturedAt = dt instanceof Date ? dt.toISOString() : new Date(dt).toISOString();
    }

    let lat: number | null = null;
    let lng: number | null = null;

    if (output.latitude !== undefined && output.longitude !== undefined) {
      lat = Math.round(output.latitude * 100) / 100;
      lng = Math.round(output.longitude * 100) / 100;
    }

    return { capturedAt, lat, lng };
  } catch (error) {
    console.warn('[SkinWISE] EXIF extraction failed:', error);
    return { capturedAt: null, lat: null, lng: null };
  }
}
