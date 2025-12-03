// components/market/MarketChart.tsx
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Market {
  market_id: number;
  market_title: string;
  outcome_a: string;
  outcome_b: string;
  yesPercentage: number;
  noPercentage: number;
  volume: string;
  participants: number;
  deadline: string;
  marketType: string;
  currency: string;
  market_data: string;
  published_date?: string;
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

// Generate data ONLY from Nov 4 onwards, starting at 50:50
function generateRaceData(
  outcome_a: string,
  outcome_b: string
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];

  // Start from Nov 4, 2025
  const startDate = new Date(2025, 12, 3); // Nov 4, 2025
  const today = new Date(2025, 12, 3); // Current date: Nov 4, 2025

  let priceA = 50; // Both start at 50%
  let priceB = 50;
  let raceWinner = "";

  // Generate data from Nov 4 to today
  for (let i = 0; i <= 0; i++) {
    // Only Nov 4
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    const dataPoint: ChartDataPoint = {
      date: currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };

    dataPoint[outcome_a.toLowerCase()] = 50;
    dataPoint[outcome_b.toLowerCase()] = 50;

    data.push(dataPoint);
  }

  return data;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-emerald-500">
        <p className="text-sm font-semibold text-emerald-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

type TimeFrame = "24h" | "7d" | "30d" | "All";

interface MarketChartProps {
  market: Market;
}

export const MarketChart = ({ market }: MarketChartProps) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("24h");

  const outcomeA = market.outcome_a;
  const outcomeB = market.outcome_b;

  const chartData = useMemo(() => {
    return generateRaceData(outcomeA, outcomeB);
  }, [outcomeA, outcomeB]);

  const currentData = chartData[chartData.length - 1];
  const priceA = 50;
  const priceB = 50;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">
                Price History
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {(["24h", "7d", "30d", "All"] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium">{outcomeA}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium">{outcomeB}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-80 bg-white dark:bg-slate-900 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
                domain={[0, 100]}
                label={{
                  value: "100%",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
              />
              <ReferenceLine
                y={50}
                stroke="#d1d5db"
                strokeDasharray="3 3"
                label={{
                  value: "50%",
                  position: "right",
                  fill: "#6b7280",
                  fontSize: 12,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey={outcomeA.toLowerCase()}
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 5 }}
                name={outcomeA}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey={outcomeB.toLowerCase()}
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", r: 5 }}
                name={outcomeB}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
          <strong>Market Start:</strong> Dec 3, 2025 at 50% / 50% odds
        </div>
      </CardContent>
    </Card>
  );
};
