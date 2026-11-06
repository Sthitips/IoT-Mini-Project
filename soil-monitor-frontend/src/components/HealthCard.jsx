import { Sprout } from "lucide-react";

function HealthCard({ sensor }) {
  const moisture = Number(sensor?.moisture ?? 0);
  const isHealthy = moisture >= 40 && moisture <= 75;

  return (
    <div className="dashboard-card w-full p-4 sm:p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#52796F]">
            Plant Health
          </p>
          <h2
            className={`mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isHealthy ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {isHealthy ? "Healthy" : "Needs Attention"}
          </h2>
        </div>

        <div
          className={`rounded-2xl p-3 sm:p-3.5 ${
            isHealthy ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          <Sprout className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
      </div>

      <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-500">
        {isHealthy
          ? "Your soil moisture is within the healthy range."
          : "Your plant may need attention. Check the soil conditions."}
      </p>
    </div>
  );
}

export default HealthCard;