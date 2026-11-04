import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function MoistureChart({history}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#52796F]">
            Soil Moisture History
          </h2>
          <p className="text-sm text-gray-500">
            Moisture levels throughout the day
          </p>
        </div>

        <span className="text-sm font-medium text-[#52796F]">
          Today
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={history}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="moistureGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#52796F"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="#52796F"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              formatter={(value) => [`${value}%`, "Moisture"]}
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            />

            <Area
              type="monotone"
              dataKey="moisture"
              stroke="#52796F"
              strokeWidth={3}
              fill="url(#moistureGradient)"
              activeDot={{ r: 6, fill: "#52796F" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MoistureChart;