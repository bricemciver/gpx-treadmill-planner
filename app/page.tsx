"use client";

import { useWizardStore } from "@/lib/store";
import { WizardProgress } from "@/components/wizard-progress";
import { StepGPXUpload } from "@/components/step-gpx-upload";
import { StepTreadmill } from "@/components/step-treadmill";
import { StepFitness } from "@/components/step-fitness";
import { StepPlanOutput } from "@/components/step-plan-output";

export default function Home() {
  const { currentStep, resetWizard } = useWizardStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepGPXUpload />;
      case 2:
        return <StepTreadmill />;
      case 3:
        return <StepFitness />;
      case 4:
        return <StepPlanOutput />;
      default:
        return <StepGPXUpload />;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Treadmill Training Plan Generator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a GPX route and generate a custom treadmill workout that simulates the terrain
          </p>
        </header>

        <WizardProgress />

        <div className="mt-8">{renderStep()}</div>

        {currentStep === 4 && (
          <div className="mt-6 text-center">
            <button
              onClick={resetWizard}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Start over with a new route
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
