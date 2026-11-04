import { Lightbulb, Droplets, CheckCircle } from "lucide-react";

function RecommendationCard({sensor}) {
  const getRecommendation = () => {
    if (sensor?.moisture < 30) {
      return {
        title: "Water your plant!",
        message:
          "The soil is dry. Your plant needs watering to maintain healthy growth.",
        icon: Droplets,
        color: "#DC6B6B",
      };
    }

    if (sensor?.moisture < 60) {
      return {
        title: "Monitor your soil",
        message:
          "Moisture levels are moderate. Keep monitoring and water if the level drops further.",
        icon: Lightbulb,
        color: "#D6A34A",
      };
    }

    return {
      title: "Great job!",
      message:
        "Your soil has sufficient moisture. Avoid watering for now.",
      icon: CheckCircle,
      color: "#52796F",
    };
  };

  const recommendation = getRecommendation();
  const Icon = recommendation.icon;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm w-full">
      <div className="flex items-center gap-3">
        <div
          className="p-3 rounded-xl"
          style={{
            backgroundColor: `${recommendation.color}20`,
          }}
        >
          <Icon size={24} color={recommendation.color} />
        </div>

        <div>
          <p className="text-lg text-[#52796F] font-semibold">
            Smart Recommendation
          </p>

          <h2
            className="text-lg font-semibold"
            style={{ color: recommendation.color }}
          >
            {recommendation.title}
          </h2>
        </div>
      </div>

      <p className="text-md text-gray-600 mt-4 leading-relaxed">
        {recommendation.message}
      </p>
    </div>
  );
}

export default RecommendationCard;