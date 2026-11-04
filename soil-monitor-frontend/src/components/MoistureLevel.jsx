function MoistureLevel({ sensor }) {
  const getStatus = () => {
    if (sensor?.moisture < 30) return "Dry";
    if (sensor?.moisture < 60) return "Moderate";
    return "Healthy";
  };

  const getColor = () => {
    if (sensor?.moisture < 30) return "#DC6B6B";
    if (sensor?.moisture < 60) return "#D6A34A";
    return "#52796F";
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg text-[#52796F] font-semibold">
          Moisture Level
        </span>

        <span
          className="text-sm font-semibold"
          style={{ backgroundColor: getColor(), color: "white", padding: "0.25rem 0.5rem", borderRadius: "1rem" }}
        >
          {getStatus()}
        </span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, moisture))}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>0% · Dry</span>
        <span>100% · Wet</span>
      </div>
    </div>
  );
}

export default MoistureLevel;