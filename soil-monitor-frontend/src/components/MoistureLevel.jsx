import { Gauge } from "lucide-react";

function MoistureLevel({ sensor }) {
  const moisture = Math.min(100, Math.max(0, Number(sensor?.moisture ?? 0)));

  const getStatus = (val) => {
    if (val < 30) return { label: "Dry", color: "#ef4444", textClass: "text-red-600", bgClass: "bg-red-500" };
    if (val < 50) return { label: "Moderate", color: "#f59e0b", textClass: "text-amber-600", bgClass: "bg-amber-500" };
    if (val <= 75) return { label: "Optimal", color: "#10b981", textClass: "text-emerald-600", bgClass: "bg-emerald-500" };
    return { label: "Saturated", color: "#06b6d4", textClass: "text-cyan-600", bgClass: "bg-cyan-500" };
  };

  const currentStatus = getStatus(moisture);

  const zones = [
    { name: "Dry", range: "0 - 30%", color: "bg-red-400", border: "border-red-200", text: "text-red-700" },
    { name: "Moderate", range: "30 - 50%", color: "bg-amber-400", border: "border-amber-200", text: "text-amber-700" },
    { name: "Optimal", range: "50 - 75%", color: "bg-emerald-500", border: "border-emerald-200", text: "text-emerald-700" },
    { name: "Saturated", range: "75 - 100%", color: "bg-cyan-400", border: "border-cyan-200", text: "text-cyan-700" },
  ];

  return (
    <div className="dashboard-card w-full p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Moisture Zone Spectrum
            </h3>
            <p className="text-xs text-slate-500">
              Soil hydration status relative to target benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: currentStatus.color }}
          />
          <span>{currentStatus.label} ({moisture}%)</span>
        </div>
      </div>

      {/* Progress Bar with Floating Pin Indicator */}
      <div className="relative pt-6 pb-2">
        {/* Floating current indicator pin */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out z-10 pointer-events-none"
          style={{
            left: `${Math.min(96, Math.max(4, moisture))}%`,
          }}
        >
          <span
            className="px-2 py-0.5 text-[11px] font-extrabold rounded-md shadow-sm text-white whitespace-nowrap"
            style={{ backgroundColor: currentStatus.color }}
          >
            {moisture}%
          </span>
          <div
            className="w-0 h-0 border-x-4 border-x-transparent border-t-4"
            style={{ borderTopColor: currentStatus.color }}
          />
        </div>

        {/* Multi-segment Zone Bar */}
        <div className="h-4 w-full rounded-full bg-slate-100 p-0.5 flex overflow-hidden shadow-inner relative">
          {/* Zone 1: Dry 0-30% */}
          <div className="w-[30%] h-full bg-gradient-to-r from-red-400 to-red-500 rounded-l-full relative" />
          {/* Zone 2: Moderate 30-50% */}
          <div className="w-[20%] h-full bg-gradient-to-r from-amber-400 to-amber-500 relative" />
          {/* Zone 3: Optimal 50-75% */}
          <div className="w-[25%] h-full bg-gradient-to-r from-emerald-500 to-emerald-600 relative" />
          {/* Zone 4: Saturated 75-100% */}
          <div className="w-[25%] h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-r-full relative" />

          {/* Active value overlay marker line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-md rounded-full -translate-x-1/2 transition-all duration-700 ease-out"
            style={{ left: `${moisture}%` }}
          />
        </div>

        {/* Axis tick labels */}
        <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
          <span>0%</span>
          <span className="translate-x-1">30%</span>
          <span>50%</span>
          <span className="-translate-x-1">75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* 4 Interactive Zone Legend Cards */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {zones.map((zone) => {
          const isActive =
            (zone.name === "Dry" && moisture < 30) ||
            (zone.name === "Moderate" && moisture >= 30 && moisture < 50) ||
            (zone.name === "Optimal" && moisture >= 50 && moisture <= 75) ||
            (zone.name === "Saturated" && moisture > 75);

          return (
            <div
              key={zone.name}
              className={`p-2.5 rounded-xl border transition-all ${
                isActive
                  ? `bg-white shadow-md border-emerald-400 ring-2 ring-emerald-400/20`
                  : `bg-slate-50/70 border-slate-100 opacity-80`
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${zone.color}`} />
                <span className={`text-xs font-bold ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                  {zone.name}
                </span>
                {isActive && (
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 font-medium">
                {zone.range}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MoistureLevel;