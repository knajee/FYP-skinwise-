import httpx, asyncio
from datetime import datetime
from dataclasses import dataclass

@dataclass
class EnvSnapshot:
    temperature: float | None   # °C
    humidity:    float | None   # %
    uv_index:    float | None
    pm25:        float | None   # µg/m³
    data_source: str            # see data_source values below

async def fetch_env_snapshot(
    lat: float,
    lng: float,
    captured_at: datetime,
    openaq_api_key: str,
    exif_source: str,
) -> EnvSnapshot:
    """
    Fetches historical environmental conditions at the EXACT capture time and location.
    Both APIs called concurrently via asyncio.gather.
    Either API failing causes graceful NULL storage — never fails the check-in.
    """
    weather_task = _fetch_open_meteo(lat, lng, captured_at)
    aq_task      = _fetch_openaq(lat, lng, captured_at, openaq_api_key)

    weather_result, aq_result = await asyncio.gather(
        weather_task, aq_task, return_exceptions=True
    )

    # ── Parse Open-Meteo ───────────────────────────────────────────────────
    temperature = humidity = uv_index = None
    meteo_ok = False
    if isinstance(weather_result, dict):
        temperature = weather_result.get('temperature')
        humidity    = weather_result.get('humidity')
        uv_index    = weather_result.get('uv_index')
        meteo_ok    = True

    # ── Parse OpenAQ ──────────────────────────────────────────────────────
    pm25   = None
    aq_ok  = False
    if isinstance(aq_result, float):
        pm25  = aq_result
        aq_ok = True

    # ── Determine data_source tag ──────────────────────────────────────────
    if not meteo_ok:
        source = 'open-meteo-unavailable'
    elif exif_source == 'assumed_upload_time':
        source = 'assumed-upload-time'
    elif meteo_ok and not aq_ok:
        source = 'open-meteo-only'
    else:
        source = 'fusion'

    return EnvSnapshot(
        temperature=temperature,
        humidity=humidity,
        uv_index=uv_index,
        pm25=pm25,
        data_source=source,
    )


async def _fetch_open_meteo(
    lat: float,
    lng: float,
    captured_at: datetime,
) -> dict | None:
    """
    Open-Meteo Historical Weather Archive API.
    Free tier — no API key required — 10,000 req/day limit.
    Returns hourly temperature_2m, relative_humidity_2m, uv_index at the capture hour.
    """
    date_str = captured_at.strftime('%Y-%m-%d')
    hour     = captured_at.hour

    url    = 'https://archive-api.open-meteo.com/v1/archive'
    params = {
        'latitude':   lat,
        'longitude':  lng,
        'start_date': date_str,
        'end_date':   date_str,
        'hourly':     'temperature_2m,relative_humidity_2m,uv_index',
        'timezone':   'auto',
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            hourly = resp.json().get('hourly', {})
            return {
                'temperature': hourly.get('temperature_2m', [None])[hour],
                'humidity':    hourly.get('relative_humidity_2m', [None])[hour],
                'uv_index':    hourly.get('uv_index', [None])[hour],
            }
    except Exception:
        return None


async def _fetch_openaq(
    lat: float,
    lng: float,
    captured_at: datetime,
    api_key: str,
) -> float | None:
    """
    OpenAQ API v3 — historical PM2.5 measurements.
    Searches within 25km radius of rounded GPS coordinates.
    Requires X-API-Key header (free tier — 10 req/s).
    Returns the PM2.5 value in µg/m³ or None if no nearby station or API fails.
    """
    url    = 'https://api.openaq.org/v3/measurements'
    params = {
        'coordinates': f'{lat},{lng}',
        'radius':      25000,
        'parameters':  'pm25',
        'date_from':   captured_at.strftime('%Y-%m-%dT%H:00:00Z'),
        'date_to':     captured_at.strftime('%Y-%m-%dT%H:59:59Z'),
        'limit':       1,
    }
    headers = {'X-API-Key': api_key}

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code != 200:
                return None
            results = resp.json().get('results', [])
            if not results:
                return None
            return float(results[0].get('value', 0)) or None
    except Exception:
        return None


async def fetch_env_no_location() -> EnvSnapshot:
    """Returns a null snapshot when no GPS or geolocation is available."""
    return EnvSnapshot(
        temperature=None, humidity=None,
        uv_index=None, pm25=None,
        data_source='no-location',
    )
