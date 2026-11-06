import api from "./axios";

const DEVICE_ID = "esp32-001";

export const getLatestReading = async (deviceId = DEVICE_ID) => {
  const response = await api.get("/sensor/latest", {
    params: { device_id: deviceId },
  });
  return response.data;
};

export const getSensorHistory = async (deviceId = DEVICE_ID) => {
  const response = await api.get("/sensor/history", {
    params: { device_id: deviceId },
  });
  return response.data.readings;
};

export const getSensorStatus = async (deviceId = DEVICE_ID) => {
  const response = await api.get("/sensor/status", {
    params: { device_id: deviceId },
  });
  return response.data;
};

export const getRecommendation = async (deviceId = DEVICE_ID) => {
  const response = await api.get("/recommendations", {
    params: { device_id: deviceId },
  });
  return response.data;
};