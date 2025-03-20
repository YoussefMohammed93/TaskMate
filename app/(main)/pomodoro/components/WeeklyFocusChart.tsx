import { BarChart } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface WeekStat {
  date: string;
  focusMinutes: number;
}

interface WeeklyFocusChartProps {
  weeklyStats: WeekStat[];
}

export function WeeklyFocusChart({ weeklyStats }: WeeklyFocusChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const values = weeklyStats.map((stat) => stat.focusMinutes);
    const maxValue = Math.max(...values) * 1.1;
    const minValue = Math.min(0, Math.min(...values) * 0.9);

    const chartPadding = { top: 30, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - chartPadding.left - chartPadding.right;
    const chartHeight = height - chartPadding.top - chartPadding.bottom;

    const scaleX = (index: number) =>
      chartPadding.left + (index / (weeklyStats.length - 1)) * chartWidth;
    const scaleY = (value: number) =>
      chartPadding.top +
      chartHeight -
      ((value - minValue) / (maxValue - minValue)) * chartHeight;

    ctx.beginPath();
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 1;

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = chartPadding.top + (i / gridLines) * chartHeight;
      const value = maxValue - (i / gridLines) * (maxValue - minValue);

      ctx.moveTo(chartPadding.left, y);
      ctx.lineTo(width - chartPadding.right, y);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.round(value) + "m", chartPadding.left - 10, y);
    }
    ctx.stroke();

    weeklyStats.forEach((stat, index) => {
      const x = scaleX(index);
      const day = new Date(stat.date).toLocaleDateString("en-US", {
        weekday: "short",
      });

      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(day, x, height - chartPadding.bottom + 10);
    });

    ctx.beginPath();
    weeklyStats.forEach((stat, index) => {
      const x = scaleX(index);
      const y = scaleY(stat.focusMinutes);

      if (index === 0) {
        ctx.moveTo(x, scaleY(0));
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(scaleX(weeklyStats.length - 1), scaleY(0));
    ctx.closePath();

    const gradient = ctx.createLinearGradient(
      0,
      chartPadding.top,
      0,
      chartPadding.top + chartHeight
    );
    gradient.addColorStop(0, "rgba(37, 99, 235, 0.3)");
    gradient.addColorStop(1, "rgba(37, 99, 235, 0.05)");
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    weeklyStats.forEach((stat, index) => {
      const x = scaleX(index);
      const y = scaleY(stat.focusMinutes);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = "rgb(37, 99, 235)";
    ctx.lineWidth = 3;
    ctx.stroke();

    weeklyStats.forEach((stat, index) => {
      const x = scaleX(index);
      const y = scaleY(stat.focusMinutes);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "rgb(37, 99, 235)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [weeklyStats]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-medium">Weekly Focus Time</h3>
      </div>

      <div className="relative h-auto w-full">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
