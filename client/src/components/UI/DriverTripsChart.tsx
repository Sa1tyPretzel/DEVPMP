import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Trip, Driver } from "../../services/api";
import Card from "./Card";

interface DriverTripsChartProps {
  trips: Trip[];
  drivers: Driver[];
}

// Generate a color palette for drivers
const DRIVER_COLORS = [
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#10b981", // emerald
  "#ec4899", // pink
  "#6366f1", // indigo
];

const DriverTripsChart: React.FC<DriverTripsChartProps> = ({ trips, drivers }) => {
  const [timeRange, setTimeRange] = useState<"90d" | "30d" | "7d">("30d");

  const { chartData, driverConfig } = useMemo(() => {
    const now = new Date();
    let daysToSubtract = 30;
    if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Filter completed trips within the time range
    const filteredTrips = trips.filter((trip) => {
      if (trip.status !== "COMPLETED") return false;
      const tripDate = new Date(trip.created_at);
      return tripDate >= startDate && tripDate <= now;
    });

    // Create date buckets
    const dateMap = new Map<string, Record<string, number>>();
    
    // Initialize date buckets
    for (let i = 0; i <= daysToSubtract; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const driverCounts: Record<string, number> = {};
      drivers.forEach((d) => {
        driverCounts[`driver_${d.id}`] = 0;
      });
      dateMap.set(dateStr, driverCounts);
    }

    // Count trips per driver per date
    filteredTrips.forEach((trip) => {
      const tripDate = new Date(trip.created_at).toISOString().split("T")[0];
      const driverId = typeof trip.driver === "object" ? trip.driver?.id : trip.driver;
      
      if (dateMap.has(tripDate) && driverId) {
        const counts = dateMap.get(tripDate)!;
        const key = `driver_${driverId}`;
        if (key in counts) {
          counts[key]++;
        }
      }
    });

    // Convert to chart data array
    const data = Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    // Create driver config for colors
    const config: Record<string, { name: string; color: string }> = {};
    drivers.forEach((driver, index) => {
      config[`driver_${driver.id}`] = {
        name: driver.full_name || driver.username,
        color: DRIVER_COLORS[index % DRIVER_COLORS.length],
      };
    });

    return { chartData: data, driverConfig: config };
  }, [trips, drivers, timeRange]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "90d":
        return "Last 3 Months";
      case "30d":
        return "Last 30 Days";
      case "7d":
        return "Last 7 Days";
      default:
        return "";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Completed Trips by Driver
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing trip completion trends for {getTimeRangeLabel().toLowerCase()}
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "90d" | "30d" | "7d")}
            className="block w-full sm:w-auto rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm px-3 py-2"
          >
            <option value="90d">Last 3 Months</option>
            <option value="30d">Last 30 Days</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {Object.entries(driverConfig).map(([key, config]) => (
                <linearGradient key={key} id={`fill_${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatDate}
              className="text-gray-500 dark:text-gray-400 text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
              className="text-gray-500 dark:text-gray-400 text-xs"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #1f2937)",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              itemStyle={{ color: "#fff" }}
              labelFormatter={formatDate}
              formatter={(value: number, name: string) => {
                const config = driverConfig[name];
                return [value, config?.name || name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                const config = driverConfig[value];
                return <span className="text-gray-700 dark:text-gray-300 text-sm">{config?.name || value}</span>;
              }}
            />
            {Object.entries(driverConfig).map(([key, config]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={config.color}
                fill={`url(#fill_${key})`}
                strokeWidth={2}
                stackId="1"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {drivers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No driver data available</p>
        </div>
      )}
    </Card>
  );
};

export default DriverTripsChart;
