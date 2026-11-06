import MoistureCard from "../components/MoistureCard";
import MoistureLevel from "../components/MoistureLevel";
import RecentReadings from "../components/RecentReadings";
import Recommendation from "../components/Recommendation";
import useSensorData from "../hooks/useSensorData";
import {
  Sprout,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const Dashboard = () => {
  const {
    sensor,
    history,
    status,
    loading,
    refreshing,
    error,
    refresh,
    lastUpdated,
    isStale,
  } = useSensorData();

  const formattedLastUpdated = (() => {
    const ts = sensor?.timestamp || lastUpdated;
    if (!ts) {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    const d = new Date(ts);
    if (isNaN(d.getTime()) || d.getFullYear() < 2024) {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  })();

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-header-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  AgroPulse
                </h1>
                <p className="text-[11px] text-emerald-100/70 font-medium">
                  Initializing telemetry link...
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          {/* Hero Moisture Skeleton */}
          <div className="dashboard-card p-6 h-56 flex flex-col justify-between">
            <div className="h-5 w-36 skeleton" />
            <div className="h-20 w-44 skeleton my-4 rounded-xl" />
            <div className="h-6 w-full skeleton" />
          </div>

          {/* Moisture Spectrum Skeleton */}
          <div className="dashboard-card p-6 h-40">
            <div className="h-5 w-40 skeleton mb-4" />
            <div className="h-6 w-full skeleton rounded-full" />
          </div>

          {/* Recommendation Skeleton */}
          <div className="dashboard-card p-6 h-48">
            <div className="h-5 w-44 skeleton mb-3" />
            <div className="h-20 w-full skeleton rounded-xl" />
          </div>

          {/* Chart Skeleton */}
          <div className="dashboard-card p-6 h-64">
            <div className="h-5 w-40 skeleton mb-4" />
            <div className="h-44 w-full skeleton rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  // Fatal error state (no sensor data available)
  if (error && !sensor) {
    return (
      <div className="dashboard-shell flex flex-col items-center justify-center p-4">
        <div className="dashboard-card max-w-md w-full p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Unable to Connect
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {error}
          </p>
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-700">Troubleshooting Steps:</div>
            <div>• Make sure the backend is running (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">port 8000</code>)</div>
            <div>• Ensure Mosquitto MQTT broker is active</div>
            <div>• Run simulator: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">python3 simulate_esp32.py</code></div>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="mt-5 w-full dashboard-refresh-btn flex items-center justify-center gap-2 py-3 bg-emerald-700 text-white hover:bg-emerald-800 font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // If sensor is still null
  if (!sensor) {
    return (
      <div className="dashboard-shell flex flex-col items-center justify-center p-4">
        <div className="dashboard-card max-w-md w-full p-6 text-center">
          <Sprout className="w-12 h-12 text-[#52796F] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">
            Waiting for Sensor Readings
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            The telemetry broker is listening. Once your ESP32 or simulator publishes data, it will appear here instantly.
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 dashboard-refresh-btn mx-auto"
          >
            Check for Updates
          </button>
        </div>
      </div>
    );
  }

  const isOnline = status?.is_online ?? true;

  return (
    <div className="dashboard-shell">
      {/* Top Navigation Bar */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-emerald-200 shadow-inner">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                  AgroPulse
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-emerald-100 border border-white/15 uppercase tracking-wider">
                  IoT Monitor
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-100/80 font-medium">
                ESP32 Soil Moisture Telemetry
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Status Pill */}
            {isOnline ? (
              <div className="dashboard-status-pill online">
                <span className="live-dot" />
                <span className="hidden xs:inline">ESP32</span> Online
              </div>
            ) : (
              <div className="dashboard-status-pill offline">
                <span className="offline-dot" />
                <span className="hidden xs:inline">ESP32</span> Offline
              </div>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="dashboard-refresh-btn"
              title="Refresh telemetry now"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-700" : ""}`}
              />
              <span className="hidden sm:inline">
                {refreshing ? "Syncing..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Stale Warning Bar if delayed */}
      {isStale && (
        <div className="mx-auto max-w-7xl w-full px-3 pt-3 sm:px-6">
          <div className="dashboard-alert">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
            <div className="flex-1 text-xs">
              <strong>Telemetry Delay:</strong> Last sensor reading was received over 30 seconds ago. Checking connection...
            </div>
            <button
              onClick={refresh}
              className="text-xs font-bold underline cursor-pointer text-amber-900 ml-auto shrink-0"
            >
              Sync Now
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <main className="dashboard-main">
        {/* Row 1: Soil Moisture Hero Card */}
        <MoistureCard sensor={sensor} />

        {/* Row 2: Moisture Zone Spectrum Gauge */}
        <MoistureLevel sensor={sensor} />

        {/* Row 3: Smart Irrigation Recommendation Card */}
        <Recommendation sensor={sensor} />

        {/* Row 4: Historical Readings Chart & Telemetry Log */}
        <RecentReadings history={history} />
      </main>

      {/* Clean Footer */}
      <footer className="mt-auto py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>🌱 AgroPulse Smart Irrigation System</span>
          <span>Last Synced: {formattedLastUpdated}</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;