import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { LineChart, List, TrendingUp, TrendingDown, Minus, Clock, Droplets, Calendar } from "lucide-react";

// Custom modern tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const moisture = payload[0].value;
    const getBadge = (val) => {
      if (val < 30) return { label: "Dry", bg: "bg-red-50 text-red-700 border-red-200" };
      if (val < 50) return { label: "Moderate", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      if (val <= 75) return { label: "Optimal", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      return { label: "Saturated", bg: "bg-cyan-50 text-cyan-700 border-cyan-200" };
    };
    const badge = getBadge(moisture);

    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 text-xs min-w-[140px]">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium pb-1.5 border-b border-slate-100">
          <Clock className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        <div className="pt-2 flex items-center justify-between gap-3">
          <span className="text-slate-600 font-medium">Moisture:</span>
          <span className="text-base font-extrabold text-slate-900">{moisture}%</span>
        </div>
        <div className="mt-1 flex justify-end">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Convert a raw time value to a Date object (or null on failure)
const parseToDate = (timeVal) => {
  if (!timeVal) return null;
  const str = String(timeVal).trim();

  // ISO timestamp (e.g. 2026-11-07T01:40:00Z)
  if (str.includes("T") || (str.includes("-") && str.length > 8)) {
    const d = new Date(str);
    if (!isNaN(d.getTime()) && d.getFullYear() >= 2024) return d;
    return null;
  }

  // Plain HH:MM or HH:MM:SS (treat as UTC)
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const parts = str.split(":").map(Number);
    const d = new Date();
    d.setUTCHours(parts[0], parts[1], parts[2] || 0, 0);
    return d;
  }

  return null;
};

// Full time with seconds — used in tooltip and log list
const formatTimeFull = (timeVal) => {
  const d = parseToDate(timeVal);
  if (!d) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

// Short time HH:MM only — used on chart X-axis ticks
const formatTimeShort = (timeVal) => {
  const d = parseToDate(timeVal);
  if (!d) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function RecentReadings({ history = [] }) {
  const [viewMode, setViewMode] = useState("chart"); // 'chart' | 'log'

  // Normalize history: store raw time + both display formats
  const normalizedHistory = useMemo(() => {
    return (history || []).map((item) => ({
      ...item,
      // rawTime keeps the original ISO string for tooltip precision
      rawTime: item.time,
      // time field holds short HH:MM for X-axis labels
      time: formatTimeShort(item.time),
      // timeFull holds HH:MM:SS for tooltip and log list
      timeFull: formatTimeFull(item.time),
    }));
  }, [history]);

  // Compute a sensible tick interval so the X-axis isn't crowded
  const xAxisInterval = useMemo(() => {
    const len = normalizedHistory.length;
    if (len <= 10) return 0;       // show all
    if (len <= 20) return 1;       // every 2nd
    if (len <= 40) return 3;       // every 4th
    if (len <= 80) return 7;       // every 8th
    return Math.floor(len / 10);   // ~10 ticks regardless
  }, [normalizedHistory.length]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!normalizedHistory || normalizedHistory.length === 0) {
      return { min: 0, max: 0, avg: 0, trend: "steady", count: 0 };
    }
    const values = normalizedHistory.map((item) => Number(item.moisture)).filter((n) => !isNaN(n));
    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0, trend: "steady", count: 0 };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / values.length);

    let trend = "steady";
    if (values.length >= 2) {
      const diff = values[values.length - 1] - values[0];
      if (diff > 2) trend = "rising";
      else if (diff < -2) trend = "falling";
    }

    return { min, max, avg, trend, count: values.length };
  }, [normalizedHistory]);

  return (
    <div className="dashboard-card w-full p-4 sm:p-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52796F]">
              Historical Telemetry
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              <Calendar className="w-3 h-3" />
              Today
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            Soil Moisture Trends
          </h3>
        </div>

        {/* View Toggle (Chart vs Log) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("chart")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "chart"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Chart</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("log")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "log"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Log List</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold block">Average</span>
          <span className="text-lg sm:text-xl font-extrabold text-slate-800">{stats.avg}%</span>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold block">Peak / Max</span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-700">{stats.max}%</span>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold block">Lowest / Min</span>
          <span className="text-lg sm:text-xl font-extrabold text-amber-600">{stats.min}%</span>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Daily Trend</span>
            <span className="text-xs sm:text-sm font-extrabold capitalize text-slate-700">
              {stats.trend}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100">
            {stats.trend === "rising" && <TrendingUp className="w-4 h-4 text-emerald-600" />}
            {stats.trend === "falling" && <TrendingDown className="w-4 h-4 text-amber-600" />}
            {stats.trend === "steady" && <Minus className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </div>

      {/* Content Area: Chart OR Log */}
      {normalizedHistory.length === 0 ? (
        <div className="h-56 sm:h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <Droplets className="w-10 h-10 text-slate-300 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No History Recorded Today</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            As the ESP32 soil sensor publishes telemetry data, moisture changes over time will automatically be visualized here.
          </p>
        </div>
      ) : viewMode === "chart" ? (
        <div className="h-60 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={normalizedHistory}
              margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="moistureGradientV2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#52796f" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={6}
                interval={xAxisInterval}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                content={<CustomTooltip />}
                labelFormatter={(label, payload) =>
                  payload && payload[0] ? payload[0].payload.timeFull || label : label
                }
              />

              <Area
                type="monotone"
                dataKey="moisture"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#moistureGradientV2)"
                activeDot={{
                  r: 5,
                  fill: "#10b981",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Reading Log List */
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
          {[...normalizedHistory].reverse().slice(0, 15).map((reading, index) => {
            const val = Number(reading.moisture);
            const isGood = val >= 40 && val <= 75;
            return (
              <div
                key={index}
                className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">{reading.timeFull}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800">{reading.moisture}%</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isGood
                        ? "bg-emerald-100 text-emerald-700"
                        : val < 40
                        ? "bg-amber-100 text-amber-700"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    {isGood ? "Optimal" : val < 40 ? "Low" : "Saturated"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentReadings;