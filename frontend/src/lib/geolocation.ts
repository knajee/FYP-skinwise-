"use client";

/**
 * Requests device geolocation wrapped in a Promise.
 * Fails open (returns null) on error, denial, or timeout.
 * Rounds to 2 decimal places.
 */
export async function requestGeolocation(): Promise<{ lat: number; lng: number } | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: Math.round(position.coords.latitude * 100) / 100,
          lng: Math.round(position.coords.longitude * 100) / 100,
        });
      },
      (error) => {
        console.warn("[SkinWISE] Geolocation request failed:", error.message);
        resolve(null);
      },
      {
        timeout: 8000,
        enableHighAccuracy: false, // Cell tower / wifi precision is sufficient (±1.1km)
      }
    );
  });
}
