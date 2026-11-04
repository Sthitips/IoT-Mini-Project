from fastapi import APIRouter

router = APIRouter(tags=["Sensor"])


@router.get("/sensor/latest")
def get_latest_reading():
    # MQTT data
    pass


@router.get("/sensor/history")
def get_sensor_history():
    # Return stored readings
    pass


@router.get("/sensor/status")
def get_sensor_status():
    # Return device connectivity information
    pass