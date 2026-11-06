import {
  Lightbulb,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from "lucide-react";

function RecommendationCard({ sensor }) {
  const moisture = Number(sensor?.moisture ?? 50);

  const getRecommendation = () => {
    if (moisture < 25) {
      return {
        title: "Immediate Watering Required",
        badge: "High Priority",
        badgeColor: "bg-red-100 text-red-700 border-red-200",
        message:
          "Soil moisture has dropped below critical threshold (25%). Plant roots are experiencing acute moisture stress.",
        action: "Apply ~300ml - 400ml water",
        timing: "Now / Immediate",
        icon: Droplets,
        color: "#ef4444",
        bannerBg: "bg-red-50/80 border-red-200",
        tips: [
          "Water slowly around the root perimeter until moisture reaches 50%.",
          "Ensure potting mix or soil absorbs the water without pooling.",
          "Re-check sensor in 15 minutes to verify uniform infiltration.",
        ],
      };
    }

    if (moisture < 45) {
      return {
        title: "Watering Recommended Soon",
        badge: "Attention Needed",
        badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
        message:
          "Soil moisture is running low. Hydration is still manageable, but watering within the next few hours is recommended.",
        action: "Apply ~200ml - 250ml water",
        timing: "Within 2 - 4 hours",
        icon: AlertTriangle,
        color: "#f59e0b",
        bannerBg: "bg-amber-50/80 border-amber-200",
        tips: [
          "Ideal watering window is early morning or late afternoon.",
          "Check topsoil layer (top 2cm) for dryness and firmness.",
          "Avoid excessive saturation; aim for the 55% - 65% target zone.",
        ],
      };
    }

    if (moisture <= 75) {
      return {
        title: "Optimal Soil Hydration",
        badge: "Healthy & Stable",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
        message:
          "Moisture is well-balanced. Soil has sufficient capillary water and aeration for active root metabolism.",
        action: "No watering needed",
        timing: "Check again tomorrow",
        icon: CheckCircle2,
        color: "#10b981",
        bannerBg: "bg-emerald-50/80 border-emerald-200",
        tips: [
          "Current moisture level promotes healthy root respiration.",
          "Maintain current ambient temperature and light conditions.",
          "Allow natural absorption before next irrigation cycle.",
        ],
      };
    }

    return {
      title: "Soil is Highly Saturated",
      badge: "Saturated",
      badgeColor: "bg-cyan-100 text-cyan-700 border-cyan-200",
      message:
        "Moisture exceeds 75%. Soil pores are largely water-filled, restricting oxygen diffusion to roots.",
      action: "Pause all irrigation",
      timing: "Wait until < 65%",
      icon: ShieldCheck,
      color: "#06b6d4",
      bannerBg: "bg-cyan-50/80 border-cyan-200",
      tips: [
        "Do not add additional water to prevent fungal issues or root rot.",
        "Ensure drainage holes are clear and not blocked by debris.",
        "Allow top layer to naturally evaporate in indirect sunlight.",
      ],
    };
  };

  const rec = getRecommendation();
  const IconComponent = rec.icon;

  return (
    <div className="dashboard-card w-full p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2.5 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${rec.color}15`, color: rec.color }}
          >
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#52796F]">
              Irrigation Advisor
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Smart Watering Guidance
            </h3>
          </div>
        </div>

        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${rec.badgeColor}`}>
          {rec.badge}
        </span>
      </div>

      {/* Action Banner */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border ${rec.bannerBg} mb-4`}>
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5"
            style={{ color: rec.color }}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {rec.title}
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {rec.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg bg-white shadow-xs text-slate-800">
                <span className="text-slate-400">Action:</span> {rec.action}
              </span>
              <span className="inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-lg bg-white/70 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{rec.timing}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agronomic Best Practice Checklist */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Recommended Best Practices
        </h5>
        <div className="space-y-2">
          {rec.tips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs sm:text-sm text-slate-700"
            >
              <CheckCircle2
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: rec.color }}
              />
              <span className="leading-snug">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecommendationCard;