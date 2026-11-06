import os

# Calibration parameters:
# Raw ADC reading when soil is completely dry (in air)
DRY_RAW = int(os.getenv("DRY_RAW", "3000"))

# Raw ADC reading when soil is saturated with water (in cup of water)
WET_RAW = int(os.getenv("WET_RAW", "1200"))


def raw_to_moisture(raw_value: int, dry_raw: int = DRY_RAW, wet_raw: int = WET_RAW) -> int:
    """
    Convert raw analog sensor reading into a moisture percentage between 1 and 100.
    
    Formula:
      moisture = 1 + ((raw_value - dry_raw) * 99 / (wet_raw - dry_raw))
    
    Clamped between 1% and 100%.
    """
    if dry_raw == wet_raw:
        return 50  # Prevent division by zero if misconfigured

    calculated = 1.0 + ((float(raw_value) - float(dry_raw)) * 99.0 / (float(wet_raw) - float(dry_raw)))
    moisture = round(calculated)
    
    # Clamp to range [1, 100]
    return max(1, min(100, int(moisture)))


def get_recommendation(moisture: int) -> dict:
    """
    Generate threshold-based watering recommendation.
    """
    if moisture < 30:
        return {
            "moisture": moisture,
            "status": "Dry",
            "recommendation": "The soil is dry. Water your plant to maintain healthy growth."
        }
    elif moisture < 60:
        return {
            "moisture": moisture,
            "status": "Moderate",
            "recommendation": "Moisture levels are moderate. Monitor soil moisture and water if needed."
        }
    else:
        return {
            "moisture": moisture,
            "status": "Healthy",
            "recommendation": "Soil has sufficient moisture. Avoid watering for now."
        }