"use client";

import { useEffect } from "react";
import { useTrainingPlanStore } from "@/lib/store";
import { generatePlan } from "@/lib/plan-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Printer, AlertTriangle, RotateCcw } from "lucide-react";
import { ElevationChart } from "./elevation-chart";

export function StepPlanOutput() {
  const gpx = useTrainingPlanStore((state) => state.gpx);
  const treadmill = useTrainingPlanStore((state) => state.treadmill);
  const fitness = useTrainingPlanStore((state) => state.fitness);
  const plan = useTrainingPlanStore((state) => state.plan);
  const setPlan = useTrainingPlanStore((state) => state.setPlan);
  const setStep = useTrainingPlanStore((state) => state.setStep);
  const reset = useTrainingPlanStore((state) => state.reset);

  useEffect(() => {
    if (gpx && fitness && !plan) {
      const generatedPlan = generatePlan(gpx, treadmill, fitness);
      setPlan(generatedPlan);
    }
  }, [gpx, treadmill, fitness, plan, setPlan]);

  if (!gpx || !fitness || !plan) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Generating plan...</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-start justify-between print:hidden">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Your Training Plan</h2>
            <p className="text-muted-foreground mt-1">
              {plan.intervals.length} intervals totaling{" "}
              {formatTotalDuration(plan.totalDuration_sec)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="print:block">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Elevation Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ElevationChart gpx={gpx} plan={plan} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Interval Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[500px] print:max-h-none print:overflow-visible">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead className="text-right">Grade (%)</TableHead>
                    <TableHead className="text-right">Incline (%)</TableHead>
                    <TableHead className="text-right">Speed (km/h)</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="text-right">Elev (m)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.intervals.map((interval, index) => {
                    const hasWarning = interval.inclineCapped || interval.speedCapped;
                    return (
                      <TableRow
                        key={interval.index}
                        className={index % 2 === 0 ? "bg-muted/30" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            {interval.index}
                            {hasWarning && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {interval.inclineCapped && (
                                    <p>Course grade exceeded treadmill limits — incline capped</p>
                                  )}
                                  {interval.speedCapped && <p>Speed capped at treadmill maximum</p>}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDistance(interval.startDist_m)} -{" "}
                          {formatDistance(interval.endDist_m)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {interval.courseGrade_pct > 0 ? "+" : ""}
                          {interval.courseGrade_pct.toFixed(1)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${
                            interval.inclineCapped ? "text-amber-600 font-bold" : ""
                          }`}
                        >
                          {interval.treadmillIncline_pct.toFixed(1)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${
                            interval.speedCapped ? "text-amber-600 font-bold" : ""
                          }`}
                        >
                          {interval.speed_kph.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatDuration(interval.duration_sec)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {interval.elevChange_m > 0 ? "+" : ""}
                          {interval.elevChange_m.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between print:hidden">
          <Button variant="outline" onClick={() => setStep(3)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
