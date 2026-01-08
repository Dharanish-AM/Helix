"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GrowthChart({ data }: { data: any[] }) {
  // Mock data if empty
  const chartData = data.length
    ? data
    : [
        { date: "2024-01-01", stars: 120 },
        { date: "2024-02-01", stars: 150 },
        { date: "2024-03-01", stars: 180 },
        { date: "2024-04-01", stars: 220 },
        { date: "2024-05-01", stars: 300 },
      ];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Profile Growth</CardTitle>
        <CardDescription>
          Tracking your Stars and influence over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--muted-foreground))"
              opacity={0.2}
            />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Line
              type="monotone"
              dataKey="stars"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
