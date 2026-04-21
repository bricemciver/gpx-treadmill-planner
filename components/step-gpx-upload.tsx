"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useTrainingPlanStore } from "@/lib/store"
import { parseGPX } from "@/lib/gpx-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle2, AlertCircle, Mountain, Ruler, ArrowRight } from "lucide-react"

export function StepGPXUpload() {
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const gpx = useTrainingPlanStore((state) => state.gpx)
  const setGPX = useTrainingPlanStore((state) => state.setGPX)
  const setStep = useTrainingPlanStore((state) => state.setStep)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      setIsProcessing(true)

      // Check file extension
      if (!file.name.toLowerCase().endsWith(".gpx")) {
        setError("Please upload a .gpx file")
        setIsProcessing(false)
        return
      }

      try {
        const content = await file.text()
        const result = parseGPX(content)

        if (!result.success) {
          setError(result.error)
        } else {
          setGPX(result.data)
        }
      } catch {
        setError("File could not be read as GPX")
      } finally {
        setIsProcessing(false)
      }
    },
    [setGPX]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0])
      }
    },
    [processFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/gpx+xml": [".gpx"],
    },
    multiple: false,
  })

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    const mi = km * 0.621371
    return `${km.toFixed(2)} km (${mi.toFixed(2)} mi)`
  }

  const formatElevation = (meters: number) => {
    const ft = meters * 3.28084
    return `${Math.round(meters)} m (${Math.round(ft)} ft)`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Upload GPX File</h2>
        <p className="text-muted-foreground mt-1">
          Upload your race course GPX file to analyze the elevation profile
        </p>
      </div>

      {!gpx ? (
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-12
            transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
            ${isProcessing ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? "Drop your GPX file here" : "Drag & drop your GPX file"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Course Analyzed</CardTitle>
            </div>
            <CardDescription>
              Your GPX file has been successfully processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-background p-2">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-medium">{formatDistance(gpx.totalDistance_m)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-background p-2">
                  <Mountain className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Elevation Gain</p>
                  <p className="font-medium text-green-600">
                    +{formatElevation(gpx.elevationGain_m)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-background p-2">
                  <Mountain className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Elevation Loss</p>
                  <p className="font-medium text-red-600">
                    -{formatElevation(gpx.elevationLoss_m)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-md bg-background p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{gpx.segments.length}</span> intervals
                parsed from course profile
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => setStep(2)}
          disabled={!gpx}
          size="lg"
        >
          Next: Treadmill Settings
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
