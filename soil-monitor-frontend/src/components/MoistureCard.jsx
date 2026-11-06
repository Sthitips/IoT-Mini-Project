import { Droplets, Clock } from "lucide-react";

function MoistureCard({ sensor }) {
  const moisture = Number(sensor?.moisture ?? 0);

  // Determine status color and label
  const getStatus = (val) => {
    if (val < 25) {
      return {
        label: "Critically Dry",
        color: "#ef4444",
        bg: "bg-red-50 text-red-700 border-red-200",
        ringColor: "#ef4444",
      };
    }
    if (val < 45) {
      return {
        label: "Low Moisture",
        color: "#f59e0b",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        ringColor: "#f59e0b",
      };
    }
    if (val <= 75) {
      return {
        label: "Optimal Range",
        color: "#10b981",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        ringColor: "#10b981",
      };
    }
    return {
      label: "High Saturation",
      color: "#06b6d4",
      bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
      ringColor: "#06b6d4",
    };
  };

  const status = getStatus(moisture);

  // SVG circular gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, moisture)) / 100) * circumference;

  const formattedTime = (() => {
    const ts = sensor?.timestamp;
    if (!ts) {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
    const d = new Date(ts);
    if (isNaN(d.getTime()) || d.getFullYear() < 2024) {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  })();

  return (
    <div className="dashboard-card w-full p-4 sm:p-6 flex flex-col justify-between">
      {/* Top row: Title and Icon badge */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#52796F]">
            Live Telemetry
          </span>
          <h3 className="text-base sm:text-xl font-bold text-slate-800">
            Soil Moisture
          </h3>
        </div>

        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${status.bg} transition-colors`}
        >
          {status.label}
        </span>
      </div>

      {/* Center content: Circular gauge & metric */}
      <div className="my-4 sm:my-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-5xl sm:text-6xl font-black tracking-tight"
              style={{ color: status.color }}
            >
              {moisture}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-400">%</span>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Volumetric Water Content
          </p>
        </div>

        {/* Circular Progress Meter */}
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={status.ringColor}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Droplets
              className="w-6 h-6 sm:w-7 sm:h-7"
              style={{ color: status.color }}
            />
          </div>
        </div>
      </div>

      {/* Clean Bottom Bar with update time and device ID */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Updated: {formattedTime}</span>
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          Device: {sensor?.device_id || "esp32-001"}
        </span>
      </div>
    </div>
  );
}

export default MoistureCard;