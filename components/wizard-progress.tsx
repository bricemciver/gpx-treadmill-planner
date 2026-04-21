"use client"

import { useTrainingPlanStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Upload, Settings, User, FileText } from "lucide-react"

const steps = [
  { number: 1, label: "GPX Upload", icon: Upload },
  { number: 2, label: "Treadmill", icon: Settings },
  { number: 3, label: "Fitness", icon: User },
  { number: 4, label: "Plan", icon: FileText },
]

export function WizardProgress() {
  const currentStep = useTrainingPlanStore((state) => state.currentStep)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.number
          const isCompleted = currentStep > step.number

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isActive || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    currentStep > step.number
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
