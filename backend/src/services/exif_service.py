from PIL import Image
from datetime import datetime, timezone
from dataclasses import dataclass
import io, math

@dataclass
class ExifResult:
    captured_at: datetime        # from EXIF tag 36867 (DateTimeOriginal) — authoritative
    lat_rounded:  float | None   # rounded to 2 decimal places (±1.1km precision)
    lng_rounded:  float | None
    exif_source:  str            # 'exif_datetime' | 'assumed_upload_time'

def extract_exif(image_bytes: bytes) -> ExifResult:
    """
    Server-side authoritative EXIF extraction.
    Client-provided timestamps are NEVER trusted as the authoritative source.
    
    Tag 36867 = DateTimeOriginal (when shutter was released)
    Tag 34853 = GPSInfo sub-IFD
    GPS format: degrees/minutes/seconds as rational tuples → convert to decimal degrees
    GPS coordinates are rounded to 2 decimal places (±1.1km) before any use or storage.
    Raw GPS coordinates are NEVER stored.
    """
    img  = Image.open(io.BytesIO(image_bytes))
    exif = img._getexif() or {}

    # ── Capture datetime ───────────────────────────────────────────────────
    dt_str = exif.get(36867)  # DateTimeOriginal
    if dt_str:
        try:
            captured_at = datetime.strptime(dt_str, '%Y:%m:%d %H:%M:%S')
            captured_at = captured_at.replace(tzinfo=timezone.utc)
            source = 'exif_datetime'
        except ValueError:
            captured_at = datetime.now(timezone.utc)
            source = 'assumed_upload_time'
    else:
        captured_at = datetime.now(timezone.utc)
        source = 'assumed_upload_time'

    # ── GPS extraction ─────────────────────────────────────────────────────
    gps_info = exif.get(34853, {})
    lat = _dms_to_decimal(gps_info.get(2), gps_info.get(1))  # lat dms, N/S ref
    lng = _dms_to_decimal(gps_info.get(4), gps_info.get(3))  # lng dms, E/W ref

    return ExifResult(
        captured_at=captured_at,
        lat_rounded=round(lat, 2) if lat is not None else None,
        lng_rounded=round(lng, 2) if lng is not None else None,
        exif_source=source,
    )

def _dms_to_decimal(
    dms: tuple | None,
    ref: str | None,
) -> float | None:
    """Convert degrees/minutes/seconds rational tuples to decimal degrees."""
    if not dms or not ref:
        return None
    try:
        def rational(r):
            return r[0] / r[1] if isinstance(r, (tuple, list)) else float(r)
        degrees = rational(dms[0])
        minutes = rational(dms[1])
        seconds = rational(dms[2])
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if ref in ('S', 'W'):
            decimal = -decimal
        return decimal
    except (IndexError, ZeroDivisionError, TypeError):
        return None
