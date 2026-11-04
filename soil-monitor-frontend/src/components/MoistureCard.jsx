import { Droplets } from "lucide-react";

function MoistureCard({sensor}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm w-full">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg text-[#52796F] font-semibold">
            Current Moisture
          </p>

          <h2 className="text-3xl font-bold text-[#52796F] mt-2">
            {sensor?.moisture}%
          </h2>
        </div>

        <div className="bg-[#E8F4EF] p-3 rounded-xl">
          <Droplets size={28} color="#52796F" />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Last updated: {new Date(sensor.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}

export default MoistureCard;