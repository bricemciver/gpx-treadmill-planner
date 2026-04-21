import type { GPXData, TreadmillParams, FitnessData, Interval, Plan } from "./store"

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

export function generatePlan(
  gpx: GPXData,
  treadmill: TreadmillParams,
  fitness: FitnessData
): Plan {
  const intervals: Interval[] = []
  let totalDuration_sec = 0

  // Convert max speed from mph to kph
  const maxSpeed_kph = treadmill.maxSpeed_mph * 1.60934

  for (let i = 0; i < gpx.segments.length; i++) {
    const segment = gpx.segments[i]

    // Compute treadmill incline
    const rawIncline = segment.grade_pct
    const clampedIncline = clamp(
      rawIncline,
      treadmill.inclineMin_pct,
      treadmill.inclineMax_pct
    )
    const treadmillIncline = roundToStep(clampedIncline, treadmill.inclineStep_pct)
    const inclineCapped = rawIncline > treadmill.inclineMax_pct || rawIncline < treadmill.inclineMin_pct

    // Compute treadmill speed
    const baseSpeed = fitness.racePace_kph
    // 2% speed reduction per 1% grade (only for positive grades)
    const gradeAdjustment = treadmillIncline > 0 ? 1 - 0.02 * treadmillIncline : 1
    const speedAdjust = baseSpeed * gradeAdjustment
    let treadmillSpeed = clamp(speedAdjust, 3.0, maxSpeed_kph)
    treadmillSpeed = Math.round(treadmillSpeed * 10) / 10 // Round to nearest 0.1 kph
    const speedCapped = speedAdjust > maxSpeed_kph

    // Compute interval duration
    const segmentLength_km = (segment.endDist_m - segment.startDist_m) / 1000
    const duration_sec = (segmentLength_km / treadmillSpeed) * 3600

    totalDuration_sec += duration_sec

    intervals.push({
      index: i + 1,
      startDist_m: segment.startDist_m,
      endDist_m: segment.endDist_m,
      courseGrade_pct: Math.round(segment.grade_pct * 10) / 10,
      treadmillIncline_pct: Math.round(treadmillIncline * 10) / 10,
      speed_kph: treadmillSpeed,
      duration_sec: Math.round(duration_sec),
      elevChange_m: Math.round(segment.elevChange_m * 10) / 10,
      inclineCapped,
      speedCapped,
    })
  }

  return {
    intervals,
    totalDuration_sec,
  }
}
