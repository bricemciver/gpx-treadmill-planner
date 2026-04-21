"use client"

import { useState } from "react"
import { useTrainingPlanStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Zap, Clock, AlertTriangle } from "lucide-react"

type InputMode = "goalTime" | "vo2max"

export function StepFitness() {
  const gpx = useTrainingPlanStore((state) => state.gpx)
  const treadmill = useTrainingPlanStore((state) => state.treadmill)
  const setFitness = useTrainingPlanStore((state) => state.setFitness)
  const setStep = useTrainingPlanStore((state) => state.setStep)

  const [inputMode, setInputMode] = useState<InputMode>("goalTime")
  const [goalHours, setGoalHours] = useState(0)
  const [goalMinutes, setGoalMinutes] = useState(0)
  const [goalSeconds, setGoalSeconds] = useState(0)
  const [vo2max, setVo2max] = useState(50)
  const [warning, setWarning] = useState<string | null>(null)

  const calculateRacePace = (): number | null => {
    if (!gpx) return null

    const totalDistance_km = gpx.totalDistance_m / 1000

    if (inputMode === "goalTime") {
      const goalTime_sec = goalHours * 3600 + goalMinutes * 60 + goalSeconds
      if (goalTime_sec <= 0) return null
      return totalDistance_km / (goalTime_sec / 3600)
    } else {
      if (vo2max < 20 || vo2max > 90) return null
      const pace_m_per_min = (vo2max - 3.5) / 0.2
      return (pace_m_per_min * 60) / 1000
    }
  }

  const racePace_kph = calculateRacePace()
  const maxSpeed_kph = treadmill.maxSpeed_mph * 1.60934
  const isPaceExceeded = racePace_kph !== null && racePace_kph > maxSpeed_kph

  const isValid = racePace_kph !== null && racePace_kph > 0

  const handleGenerate = () => {
    if (!racePace_kph) return

    const goalTime_sec =
      inputMode === "goalTime"
        ? goalHours * 3600 + goalMinutes * 60 + goalSeconds
        : undefined

    setFitness({
      goalTime_sec,
      vo2max: inputMode === "vo2max" ? vo2max : undefined,
      racePace_kph,
    })

    if (isPaceExceeded) {
      setWarning("Your target pace exceeds your treadmill's maximum speed. Intervals will be capped.")
    }

    setStep(4)
  }

  const formatPace = (kph: number) => {
    const minPerKm = 60 / kph
    const mins = Math.floor(minPerKm)
    const secs = Math.round((minPerKm - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, "0")} /km`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Personal Fitness</h2>
        <p className="text-muted-foreground mt-1">
          Enter your goal race time or VO2 max to calculate training paces
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          className={`cursor-pointer transition-colors ${
            inputMode === "goalTime" ? "border-primary ring-2 ring-primary/20" : ""
          }`}
          onClick={() => setInputMode("goalTime")}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Goal Race Time</CardTitle>
            </div>
            <CardDescription>
              Enter your target finish time for the race
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={goalHours}
                  onChange={(e) => setGoalHours(parseInt(e.target.value) || 0)}
                  disabled={inputMode !== "goalTime"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={goalMinutes}
                  onChange={(e) => setGoalMinutes(parseInt(e.target.value) || 0)}
                  disabled={inputMode !== "goalTime"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seconds">Seconds</Label>
                <Input
                  id="seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={goalSeconds}
                  onChange={(e) => setGoalSeconds(parseInt(e.target.value) || 0)}
                  disabled={inputMode !== "goalTime"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            inputMode === "vo2max" ? "border-primary ring-2 ring-primary/20" : ""
          }`}
          onClick={() => setInputMode("vo2max")}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">VO2 Max</CardTitle>
            </div>
            <CardDescription>
              Use your VO2 max to estimate target pace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vo2max">VO2 Max (ml/kg/min)</Label>
              <Input
                id="vo2max"
                type="number"
                min="20"
                max="90"
                value={vo2max}
                onChange={(e) => setVo2max(parseInt(e.target.value) || 0)}
                disabled={inputMode !== "vo2max"}
              />
              <p className="text-xs text-muted-foreground">
                Typical range: 35-60 for recreational runners
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {racePace_kph && racePace_kph > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calculated Race Pace</p>
                <p className="text-2xl font-bold">{racePace_kph.toFixed(1)} km/h</p>
                <p className="text-sm text-muted-foreground">{formatPace(racePace_kph)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Treadmill Max Speed</p>
                <p className="text-2xl font-bold">{maxSpeed_kph.toFixed(1)} km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isPaceExceeded && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Your target pace exceeds your treadmill&apos;s maximum speed. Intervals will be capped.
          </AlertDescription>
        </Alert>
      )}

      {warning && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">{warning}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleGenerate} disabled={!isValid} size="lg">
          Generate Plan
        </Button>
      </div>
    </div>
  )
}
