import { create } from "zustand";

export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  dist_m: number;
}

export interface Segment {
  startDist_m: number;
  endDist_m: number;
  elevStart: number;
  elevEnd: number;
  grade_pct: number;
  elevChange_m: number;
}

export interface GPXData {
  points: TrackPoint[];
  segments: Segment[];
  totalDistance_m: number;
  elevationGain_m: number;
  elevationLoss_m: number;
}

export interface TreadmillParams {
  inclineMin_pct: number;
  inclineMax_pct: number;
  inclineStep_pct: number;
  maxSpeed_mph: number;
  speedStep_mph: number;
}

export interface FitnessData {
  goalTime_sec?: number;
  vo2max?: number;
  racePace_kph: number;
}

export interface Interval {
  index: number;
  startDist_m: number;
  endDist_m: number;
  courseGrade_pct: number;
  treadmillIncline_pct: number;
  speed_kph: number;
  duration_sec: number;
  elevChange_m: number;
  inclineCapped: boolean;
  speedCapped: boolean;
}

export interface Plan {
  intervals: Interval[];
  totalDuration_sec: number;
}

interface TrainingPlanState {
  currentStep: number;
  gpx: GPXData | null;
  treadmill: TreadmillParams;
  fitness: FitnessData | null;
  plan: Plan | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setGPX: (gpx: GPXData) => void;
  setTreadmill: (params: TreadmillParams) => void;
  setFitness: (fitness: FitnessData) => void;
  setPlan: (plan: Plan) => void;
  reset: () => void;
  resetWizard: () => void;
}

const defaultTreadmill: TreadmillParams = {
  inclineMin_pct: 0,
  inclineMax_pct: 15,
  inclineStep_pct: 0.5,
  maxSpeed_mph: 12,
  speedStep_mph: 0.1,
};

export const useTrainingPlanStore = create<TrainingPlanState>((set) => ({
  currentStep: 1,
  gpx: null,
  treadmill: defaultTreadmill,
  fitness: null,
  plan: null,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  setGPX: (gpx) => set({ gpx }),
  setTreadmill: (params) => set({ treadmill: params }),
  setFitness: (fitness) => set({ fitness }),
  setPlan: (plan) => set({ plan }),
  reset: () =>
    set({
      currentStep: 1,
      gpx: null,
      treadmill: defaultTreadmill,
      fitness: null,
      plan: null,
    }),
  resetWizard: () =>
    set({
      currentStep: 1,
      gpx: null,
      treadmill: defaultTreadmill,
      fitness: null,
      plan: null,
    }),
}));

// Alias for backward compatibility
export const useWizardStore = useTrainingPlanStore;
