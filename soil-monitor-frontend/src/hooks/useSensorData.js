import { useState, useEffect, useCallback } from "react";

import {
  getLatestReading,
  getSensorHistory,
  getSensorStatus,
} from "../api/sensorApi";

function useSensorData() {
  const [sensor, setSensor] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [latest, readings, device] =
        await Promise.all([
          getLatestReading(),
          getSensorHistory(),
          getSensorStatus(),
        ]);

      setSensor(latest);
      setHistory(readings);
      setStatus(device);

      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to fetch sensor data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 5000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    sensor,
    history,
    status,
    loading,
    error,
    refresh: fetchDashboardData,
  };
}

export default useSensorData;