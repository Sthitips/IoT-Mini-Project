import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import sensor
from app.mqtt.subscriber import start_mqtt, stop_mqtt

load_dotenv()

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start MQTT background subscriber
    start_mqtt()
    yield
    # Shutdown: Gracefully stop MQTT connection
    stop_mqtt()


app = FastAPI(
    title="Soil Monitoring API",
    description="Backend API for IoT Soil Moisture Monitoring System with MQTT and Mosquitto integration.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend access (allows localhost and mobile phones on Wi-Fi)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prevent browsers from caching dynamic sensor telemetry
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Include Sensor REST API router
app.include_router(sensor.router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "🌱 Soil Monitoring API is running",
        "docs_url": "/docs",
        "endpoints": [
            "/api/sensor/latest",
            "/api/sensor/history",
            "/api/sensor/status",
            "/api/sensor/readings",
            "/api/recommendations"
        ]
    }