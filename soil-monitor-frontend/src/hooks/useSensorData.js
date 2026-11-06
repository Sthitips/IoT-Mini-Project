import { useState, useEffect, useCallback, useRef } from "react";
import {
  getLatestReading,
  getSensorHistory,
  getSensorStatus,
} from "../api/sensorApi";

function useSensorData() {
  const [sensor, setSensor] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const lastUpdatedRef = useRef(lastUpdated);

  useEffect(() => {
    lastUpdatedRef.current = lastUpdated;
  }, [lastUpdated]);

  const performFetch = useCallback(async (isManual = false) => {
    const deviceId = "esp32-001";
    if (isManual) setRefreshing(true);

    try {
      const now = Date.now();
      const [latest, readings, device] = await Promise.all([
        getLatestReading(deviceId),
        getSensorHistory(deviceId),
        getSensorStatus(deviceId),
      ]);

      setSensor(latest);
      setHistory(readings || []);
      setStatus(device);
      setLastUpdated(now);
      setIsStale(false);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to connect to ESP32 sensor service."
      );
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initial load
    const init = async () => {
      if (mounted) {
        await performFetch(false);
      }
    };
    init();

    // 3-second polling for real-time sensor updates
    const pollInterval = setInterval(() => {
      performFetch(false);
    }, 3000);

    // 5-second staleness check without rendering impure Date.now
    const staleInterval = setInterval(() => {
      if (lastUpdatedRef.current && Date.now() - lastUpdatedRef.current > 30000) {
        setIsStale(true);
      }
    }, 5000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        performFetch(false);
      }
    };

    const handleFocus = () => {
      performFetch(false);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      clearInterval(staleInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [performFetch]);

  return {
    sensor,
    history,
    status,
    loading,
    refreshing,
    error,
    lastUpdated,
    isStale,
    refresh: () => performFetch(true),
  };
}

export default useSensorData;