"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Upload, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processImage, saveDocumentData } from "@/app/actions/ocr"
import { useToast } from "@/components/ui/use-toast"

export default function DocumentScanPage() {
  const [activeTab, setActiveTab] = useState("camera")
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setIsCapturing(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
      })
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCapturing(false)
    }
  }

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageDataUrl = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageDataUrl)
        stopCamera()
      }
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCapturedImage(result)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error reading file:", error)
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to read the uploaded file.",
      })
    }
  }

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Reset the process
  const resetProcess = () => {
    setCapturedImage(null)
    setExtractedData(null)
    setIsProcessing(false)
    if (activeTab === "camera") {
      startCamera()
    }
  }

  // Process the captured image
  const processDocument = async () => {
    if (!capturedImage) return

    setIsProcessing(true)

    try {
      // First upload the image to get a URL
      const formData = new FormData()

      // Convert base64 to blob
      const base64Response = await fetch(capturedImage)
      const blob = await base64Response.blob()

      formData.append("file", blob, "document.jpg")

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image")
      }

      const { url } = await uploadResponse.json()

      // Now process the image with OCR
      const result = await processImage(url)

      if (result.success && result.data) {
        setExtractedData(result.data)

        // For demo purposes, we'll use a fixed client ID
        // In a real app, you would select the client first or create a new one
        setClientId("123e4567-e89b-12d3-a456-426614174000")

        toast({
          title: "Document Processed",
          description: "Successfully extracted information from the document.",
        })
      } else {
        throw new Error(result.error || "Failed to process image")
      }
    } catch (error) {
      console.error("Processing error:", error)
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to process the document. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Save the document data
  const saveDocument = async () => {
    if (!extractedData || !clientId || !capturedImage) return

    setIsProcessing(true)

    try {
      const result = await saveDocumentData(clientId, extractedData, capturedImage)

      if (result.success) {
        toast({
          title: "Document Saved",
          description: "Document information has been saved successfully.",
        })

        // Navigate back to client page or wherever appropriate
        router.push(`/clients/${clientId}`)
      } else {
        throw new Error(result.error || "Failed to save document")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save the document data. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
  }

  // Start camera when component mounts if camera tab is active
  useState(() => {
    if (activeTab === "camera") {
      startCamera()
    }

    // Cleanup when component unmounts
    return () => {
      stopCamera()
    }
  })

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Document Scanner</CardTitle>
          <CardDescription>Scan an ID document to extract information</CardDescription>
        </CardHeader>

        <CardContent>
          {!capturedImage ? (
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera">Camera</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="camera" className="space-y-4">
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                </div>

                <Button onClick={captureImage} className="w-full" disabled={!isCapturing}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Document
                </Button>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={triggerFileUpload}
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG (max. 10MB)</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                />
              </TabsContent>
            </Tabs>
          ) : extractedData ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured document"
                  className="max-h-40 rounded-lg border border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Extracted Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Name:</div>
                  <div>{extractedData.name || "Not detected"}</div>

                  <div className="font-medium">Document Type:</div>
                  <div>{extractedData.document_type || "Not detected"}</div>

                  <div className="font-medium">Document Number:</div>
                  <div>{extractedData.document_number || "Not detected"}</div>

                  <div className="font-medium">Date of Birth:</div>
                  <div>{extractedData.date_of_birth || "Not detected"}</div>

                  <div className="font-medium">Expiration Date:</div>
                  <div>{extractedData.expiration_date || "Not detected"}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured document"
                  className="max-h-40 rounded-lg border border-gray-200"
                />
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-gray-500">Processing document...</p>
                </div>
              ) : (
                <Button onClick={processDocument} className="w-full">
                  Process Document
                </Button>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {capturedImage && (
            <>
              <Button variant="outline" onClick={resetProcess} disabled={isProcessing}>
                Try Again
              </Button>

              {extractedData && (
                <Button onClick={saveDocument} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Document
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      {/* Hidden canvas for capturing images */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

