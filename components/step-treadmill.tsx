"use client";

import { useState, useEffect } from "react";
import { useTrainingPlanStore, type TreadmillParams } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Settings } from "lucide-react";

interface FieldError {
  inclineMin?: string;
  inclineMax?: string;
  inclineStep?: string;
  maxSpeed?: string;
  speedStep?: string;
}

export function StepTreadmill() {
  const treadmill = useTrainingPlanStore((state) => state.treadmill);
  const setTreadmill = useTrainingPlanStore((state) => state.setTreadmill);
  const setStep = useTrainingPlanStore((state) => state.setStep);

  const [form, setForm] = useState<TreadmillParams>(treadmill);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setForm(treadmill);
  }, [treadmill]);

  const validate = (values: TreadmillParams): FieldError => {
    const newErrors: FieldError = {};

    if (values.inclineMin_pct < -6 || values.inclineMin_pct > 0) {
      newErrors.inclineMin = "Must be between -6 and 0";
    }

    if (values.inclineMax_pct <= values.inclineMin_pct) {
      newErrors.inclineMax = "Must be greater than minimum incline";
    } else if (values.inclineMax_pct > 40) {
      newErrors.inclineMax = "Must be 40 or less";
    }

    if (values.inclineStep_pct < 0.1 || values.inclineStep_pct > 2.0) {
      newErrors.inclineStep = "Must be between 0.1 and 2.0";
    } else if (values.inclineStep_pct > values.inclineMax_pct - values.inclineMin_pct) {
      newErrors.inclineStep = "Must be less than incline range";
    }

    if (values.maxSpeed_mph < 5 || values.maxSpeed_mph > 20) {
      newErrors.maxSpeed = "Must be between 5 and 20 mph";
    }

    if (values.speedStep_mph < 0.05 || values.speedStep_mph > 1) {
      newErrors.speedStep = "Must be between 0.05 and 1 mph";
    }

    return newErrors;
  };

  const handleChange = (field: keyof TreadmillParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newForm = { ...form, [field]: numValue };
    setForm(newForm);

    if (touched[field]) {
      setErrors(validate(newForm));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  };

  const isValid = Object.keys(validate(form)).length === 0;

  const handleNext = () => {
    setTreadmill(form);
    setStep(3);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Treadmill Parameters</h2>
        <p className="text-muted-foreground mt-1">
          Configure your treadmill&apos;s capabilities and constraints
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incline Settings</CardTitle>
            <CardDescription>
              Set the incline range and step size for your treadmill
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inclineMin">Minimum Incline (%)</Label>
              <Input
                id="inclineMin"
                type="number"
                step="0.5"
                value={form.inclineMin_pct}
                onChange={(e) => handleChange("inclineMin_pct", e.target.value)}
                onBlur={() => handleBlur("inclineMin")}
                className={errors.inclineMin && touched.inclineMin ? "border-destructive" : ""}
              />
              {errors.inclineMin && touched.inclineMin && (
                <p className="text-sm text-destructive">{errors.inclineMin}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inclineMax">Maximum Incline (%)</Label>
              <Input
                id="inclineMax"
                type="number"
                step="0.5"
                value={form.inclineMax_pct}
                onChange={(e) => handleChange("inclineMax_pct", e.target.value)}
                onBlur={() => handleBlur("inclineMax")}
                className={errors.inclineMax && touched.inclineMax ? "border-destructive" : ""}
              />
              {errors.inclineMax && touched.inclineMax && (
                <p className="text-sm text-destructive">{errors.inclineMax}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inclineStep">Incline Step Size (%)</Label>
              <Input
                id="inclineStep"
                type="number"
                step="0.1"
                value={form.inclineStep_pct}
                onChange={(e) => handleChange("inclineStep_pct", e.target.value)}
                onBlur={() => handleBlur("inclineStep")}
                className={errors.inclineStep && touched.inclineStep ? "border-destructive" : ""}
              />
              {errors.inclineStep && touched.inclineStep && (
                <p className="text-sm text-destructive">{errors.inclineStep}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Speed Settings</CardTitle>
            <CardDescription>
              Set the maximum speed and step size for your treadmill
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxSpeed">Maximum Speed (mph)</Label>
              <Input
                id="maxSpeed"
                type="number"
                step="0.1"
                value={form.maxSpeed_mph}
                onChange={(e) => handleChange("maxSpeed_mph", e.target.value)}
                onBlur={() => handleBlur("maxSpeed")}
                className={errors.maxSpeed && touched.maxSpeed ? "border-destructive" : ""}
              />
              {errors.maxSpeed && touched.maxSpeed && (
                <p className="text-sm text-destructive">{errors.maxSpeed}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="speedStep">Speed Step Size (mph)</Label>
              <Input
                id="speedStep"
                type="number"
                step="0.05"
                value={form.speedStep_mph}
                onChange={(e) => handleChange("speedStep_mph", e.target.value)}
                onBlur={() => handleBlur("speedStep")}
                className={errors.speedStep && touched.speedStep ? "border-destructive" : ""}
              />
              {errors.speedStep && touched.speedStep && (
                <p className="text-sm text-destructive">{errors.speedStep}</p>
              )}
            </div>

            <div className="mt-6 rounded-md border border-muted bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Select Treadmill Model</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Coming Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isValid} size="lg">
          Next: Fitness Info
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
