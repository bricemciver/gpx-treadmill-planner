"use client";

import { useMemo } from "react";
import type { GPXData, Plan } from "@/lib/store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ElevationChartProps {
  gpx: GPXData;
  plan: Plan;
}

export function ElevationChart({ gpx, plan }: ElevationChartProps) {
  const chartData = useMemo(() => {
    // Sample course elevation data at regular intervals for smoothness
    const samplePoints = 100;
    const courseData: { distance: number; courseElevation: number }[] = [];

    for (let i = 0; i <= samplePoints; i++) {
      const targetDist = (i / samplePoints) * gpx.totalDistance_m;

      // Find the two points surrounding this distance
      let courseEle = gpx.points[0].ele;
      for (let j = 1; j < gpx.points.length; j++) {
        if (gpx.points[j].dist_m >= targetDist) {
          const prev = gpx.points[j - 1];
          const curr = gpx.points[j];
          const ratio = (targetDist - prev.dist_m) / (curr.dist_m - prev.dist_m);
          courseEle = prev.ele + (curr.ele - prev.ele) * ratio;
          break;
        }
        courseEle = gpx.points[j].ele;
      }

      courseData.push({
        distance: targetDist / 1000,
        courseElevation: Math.round(courseEle * 10) / 10,
      });
    }

    // Calculate simulated treadmill elevation
    let simulatedEle = gpx.points[0].ele;
    const treadmillData: { distance: number; treadmillElevation: number }[] = [
      { distance: 0, treadmillElevation: simulatedEle },
    ];

    for (const interval of plan.intervals) {
      const segmentLength = interval.endDist_m - interval.startDist_m;
      const elevChange = (interval.treadmillIncline_pct / 100) * segmentLength;
      simulatedEle += elevChange;
      treadmillData.push({
        distance: interval.endDist_m / 1000,
        treadmillElevation: Math.round(simulatedEle * 10) / 10,
      });
    }

    // Merge the two datasets
    const merged = courseData.map((point) => {
      // Find closest treadmill point
      let treadmillEle = treadmillData[0].treadmillElevation;
      for (let i = 1; i < treadmillData.length; i++) {
        if (treadmillData[i].distance >= point.distance) {
          const prev = treadmillData[i - 1];
          const curr = treadmillData[i];
          if (curr.distance === prev.distance) {
            treadmillEle = curr.treadmillElevation;
          } else {
            const ratio = (point.distance - prev.distance) / (curr.distance - prev.distance);
            treadmillEle =
              prev.treadmillElevation + (curr.treadmillElevation - prev.treadmillElevation) * ratio;
          }
          break;
        }
        treadmillEle = treadmillData[i].treadmillElevation;
      }

      return {
        ...point,
        treadmillElevation: Math.round(treadmillEle * 10) / 10,
      };
    });

    return merged;
  }, [gpx, plan]);

  const minEle = Math.min(
    ...chartData.map((d) => Math.min(d.courseElevation, d.treadmillElevation)),
  );
  const maxEle = Math.max(
    ...chartData.map((d) => Math.max(d.courseElevation, d.treadmillElevation)),
  );
  const padding = (maxEle - minEle) * 0.1;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="distance"
            tickFormatter={(value) => `${value.toFixed(1)}`}
            label={{ value: "Distance (km)", position: "bottom", offset: -5 }}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[Math.floor(minEle - padding), Math.ceil(maxEle + padding)]}
            tickFormatter={(value) => `${Math.round(value)}`}
            label={{ value: "Elevation (m)", angle: -90, position: "insideLeft" }}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)} m`,
              name === "courseElevation" ? "Course" : "Treadmill",
            ]}
            labelFormatter={(label) => `${Number(label).toFixed(2)} km`}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="courseElevation"
            name="Course Elevation"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="treadmillElevation"
            name="Treadmill Simulation"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
