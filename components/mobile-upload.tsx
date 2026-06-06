"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, X, CheckCircle, AlertCircle } from "lucide-react"

interface MobileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number // in MB
}

export function MobileUpload({ onUpload, accept = "image/*,application/pdf", maxSize = 10 }: MobileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setErrorMessage(`File size exceeds ${maxSize}MB limit`)
      setUploadStatus("error")
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")

    try {
      await onUpload(file)
      setUploadStatus("success")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed")
      setUploadStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const resetUpload = () => {
    setUploadStatus("idle")
    setErrorMessage("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Upload Document</CardTitle>
        <CardDescription>
          Take a photo or select a file from your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadStatus === "idle" && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="h-6 w-6" />
              <span className="text-sm">Take Photo</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Choose File</span>
            </Button>
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <p className="text-center text-sm text-gray-600">Document uploaded successfully</p>
            <Button variant="outline" size="sm" onClick={resetUpload}>
              Upload Another
            </Button>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <p className="text-center text-sm text-red-600">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={resetUpload}>
              Try Again
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}
