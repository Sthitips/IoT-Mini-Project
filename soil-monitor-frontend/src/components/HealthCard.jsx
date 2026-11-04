import { Sprout } from "lucide-react";

function HealthCard({ sensor }) {
  const isHealthy = sensor?.moisture >= 60;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm w-full">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg text-[#52796F] font-semibold">
            Plant Health
          </p>

          <h2 className="text-2xl font-bold text-[#52796F] mt-2">
            {isHealthy ? "Healthy" : "Needs Attention"}
          </h2>
        </div>

        <div className="bg-[#E8F4EF] p-3 rounded-xl">
          <Sprout size={28} color="#52796F" />
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-3">
        {isHealthy
          ? "Your soil moisture is within the healthy range."
          : "Your plant may need attention. Check the soil conditions."}
      </p>
    </div>
  );
}

export default HealthCard;