import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Trip } from "../../services/api";
import Card from "./Card";

interface FuelUsageChartProps {
  trips: Trip[];
}

type TimeRange = "3m" | "6m" | "4w" | "7d";

const FuelUsageChart: React.FC<FuelUsageChartProps> = ({ trips }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("3m");

  const { chartData, periodLabel, trendPercentage, isPositiveTrend } = useMemo(() => {
    const now = new Date();
    const completedTrips = trips.filter((trip) => trip.status === "COMPLETED");

    let data: { period: string; fuel: number }[] = [];
    let label = "";
    let previousPeriodFuel = 0;
    let currentPeriodFuel = 0;

    if (timeRange === "3m" || timeRange === "6m") {
      // Group by months
      const monthsCount = timeRange === "3m" ? 3 : 6;
      label = `Last ${monthsCount} months`;
      
      const monthData = new Map<string, number>();
      
      for (let i = monthsCount - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthData.set(monthKey, 0);
      }

      completedTrips.forEach((trip) => {
        const tripDate = new Date(trip.created_at);
        const monthsDiff = (now.getFullYear() - tripDate.getFullYear()) * 12 + (now.getMonth() - tripDate.getMonth());
        
        if (monthsDiff >= 0 && monthsDiff < monthsCount) {
          const monthKey = tripDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          if (monthData.has(monthKey)) {
            monthData.set(monthKey, monthData.get(monthKey)! + Number(trip.fuel_used || 0));
          }
        }
      });

      data = Array.from(monthData.entries()).map(([period, fuel]) => ({
        period,
        fuel: Number(fuel.toFixed(1)),
      }));

      // Calculate trend
      if (data.length >= 2) {
        currentPeriodFuel = data[data.length - 1].fuel;
        previousPeriodFuel = data[data.length - 2].fuel;
      }

    } else if (timeRange === "4w") {
      // Group by weeks
      label = "Last 4 weeks";
      const weekData = new Map<string, number>();
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - now.getDay());
        const weekKey = `Week ${4 - i}`;
        weekData.set(weekKey, 0);
      }

      completedTrips.forEach((trip) => {
        const tripDate = new Date(trip.created_at);
        const daysDiff = Math.floor((now.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(daysDiff / 7);
        
        if (weekIndex >= 0 && weekIndex < 4) {
          const weekKey = `Week ${4 - weekIndex}`;
          if (weekData.has(weekKey)) {
            weekData.set(weekKey, weekData.get(weekKey)! + Number(trip.fuel_used || 0));
          }
        }
      });

      data = Array.from(weekData.entries()).map(([period, fuel]) => ({
        period,
        fuel: Number(fuel.toFixed(1)),
      }));

      if (data.length >= 2) {
        currentPeriodFuel = data[data.length - 1].fuel;
        previousPeriodFuel = data[data.length - 2].fuel;
      }

    } else if (timeRange === "7d") {
      // Group by days
      label = "Last 7 days";
      const dayData = new Map<string, number>();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayKey = date.toLocaleDateString("en-US", { weekday: "short" });
        dayData.set(dayKey, 0);
      }

      completedTrips.forEach((trip) => {
        const tripDate = new Date(trip.created_at);
        const daysDiff = Math.floor((now.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff < 7) {
          const dayKey = tripDate.toLocaleDateString("en-US", { weekday: "short" });
          if (dayData.has(dayKey)) {
            dayData.set(dayKey, dayData.get(dayKey)! + Number(trip.fuel_used || 0));
          }
        }
      });

      data = Array.from(dayData.entries()).map(([period, fuel]) => ({
        period,
        fuel: Number(fuel.toFixed(1)),
      }));

      if (data.length >= 2) {
        currentPeriodFuel = data[data.length - 1].fuel;
        previousPeriodFuel = data[data.length - 2].fuel;
      }
    }

    // Calculate trend percentage
    let trend = 0;
    let positive = true;
    if (previousPeriodFuel > 0) {
      trend = ((currentPeriodFuel - previousPeriodFuel) / previousPeriodFuel) * 100;
      positive = trend >= 0;
    }

    return {
      chartData: data,
      periodLabel: label,
      trendPercentage: Math.abs(trend).toFixed(1),
      isPositiveTrend: positive,
    };
  }, [trips, timeRange]);

  const totalFuel = chartData.reduce((sum, d) => sum + d.fuel, 0);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fuel Consumption
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {periodLabel}
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="block w-full sm:w-auto rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm px-3 py-2"
          >
            <option value="6m">Last 6 Months</option>
            <option value="3m">Last 3 Months</option>
            <option value="4w">Last 4 Weeks</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-gray-500 dark:text-gray-400 text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-gray-500 dark:text-gray-400 text-xs"
              tickFormatter={(value) => `${value}L`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              formatter={(value: number) => [`${value} L`, "Fuel Used"]}
            />
            <Bar 
              dataKey="fuel" 
              fill="#14b8a6" 
              radius={[6, 6, 0, 0]}
            >
              <LabelList
                dataKey="fuel"
                position="top"
                offset={8}
                className="fill-gray-600 dark:fill-gray-300"
                fontSize={11}
                formatter={(value: number) => value > 0 ? `${value}L` : ""}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPositiveTrend ? (
            <TrendingUp className="w-4 h-4 text-red-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-green-500" />
          )}
          <span className={`text-sm font-medium ${isPositiveTrend ? "text-red-600" : "text-green-600"}`}>
            {isPositiveTrend ? "Up" : "Down"} {trendPercentage}% from previous period
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: <span className="font-semibold text-gray-900 dark:text-white">{totalFuel.toFixed(1)} L</span>
        </div>
      </div>
    </Card>
  );
};

export default FuelUsageChart;
