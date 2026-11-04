import api from "./axios";

export const getLatestReading = async () => {
  const response = await api.get("/sensor/latest");
  return response.data;
};

export const getSensorHistory = async () => {
  const response = await api.get("/sensor/history");
  return response.data.readings;
};

export const getSensorStatus = async () => {
  const response = await api.get("/sensor/status");
  return response.data;
};

export const getRecommendation = async () => {
  const response = await api.get("/recommendations");
  return response.data;
};