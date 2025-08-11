"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, Upload, CheckCircle, XCircle, User } from "lucide-react"
import { createWorker } from "tesseract.js"
import { useToast } from "@/components/ui/use-toast"
import { EmergencyPopup } from "@/components/emergency-popup"
import { BanModal } from "@/app/components/ban-modal"
import { BannedClientModal } from "@/app/components/banned-client-modal"
import { createClient, getDailyStats, createVisit, getClientByRut } from "@/app/actions/clients"
import { parseSpanishDate } from "@/app/utils/date-parser"
import { banClient } from "@/app/actions/ban-client"
import { detectDocumentBounds, extractFace, enhanceImageForOCR } from "@/utils/image-processing"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { CriticalDataDialog } from "@/app/components/critical-data-dialog"
import { getCurrentUser } from "@/lib/auth-client"

export default function DocumentScanner() {

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState({
    run: "",
    apellidos: "",
    nombres: "",
    nacionalidad: "",
    sexo: "",
    nacimiento: "",
    edad: "",
  })
  const [showEmergency, setShowEmergency] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showBannedClientModal, setShowBannedClientModal] = useState(false)
  const [bannedClientData, setBannedClientData] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successAction, setSuccessAction] = useState<"ban" | "accept" | null>(null)
  const [stats, setStats] = useState({
    totalVisits: 0,
    incidents: 0,
    femaleCount: 0,
    maleCount: 0,
  })

  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState<string>("")
  const [showCriticalDataError, setShowCriticalDataError] = useState(false)
  const [clientType, setClientType] = useState<string>("")

  // Función auxiliar para verificar si el cliente está en la lista de invitados
  const checkIfInGuestList = async (rut: string) => {
    try {
      // Aquí deberías hacer una consulta real a tu base de datos
      // Por ahora, simulamos con una verificación simple
      const { data, error } = await supabase.from("guests").select("*").eq("rut", rut)
      console.log("Verificando lista de invitados:", rut, "Resultado:", data, error)
      if (data?.length > 0) {
        console.log("Cliente encontrado en la lista de invitados:", data)
        // Si hay datos, el cliente está en la lista de invitados
        return true
      }
      return false
    } catch (error) {
      console.error("Error verificando lista de invitados:", error)
      return false
    }
  }

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Determine client type based on captured data
  useEffect(() => {
    
    const determineClientType = async () => {
      if (!ocrResult.run) {
        setClientType("")
        return
      }

      try {
        // Verificar si el cliente está baneado
        const existingClient = await getClientByRut(ocrResult.run)

        if (existingClient?.is_banned) {
          setClientType("Baneado")
          return
        }

        // Verificar si el cliente está en la lista de invitados
        const isInGuestList = await checkIfInGuestList(ocrResult.run)
        console.log("Verificando lista de invitados:", ocrResult.run, "Resultado:", isInGuestList)
        if (isInGuestList) {    
          setClientType("Invitado")
          return
        }
        // Si no está baneado ni es invitado, es un cliente regular
        setClientType("Regular")
      } catch (error) {
        console.error("Error al determinar el tipo de cliente:", error)
        setClientType("Regular")
      }
    }

    if (ocrResult.run) {
      determineClientType()
    } else {
      setClientType("")
    }
  }, [ocrResult])

  useEffect(() => {
    const loadStats = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
      
      if (user && user.establishment_id) {
        const dailyStats = await getDailyStats(user.establishment_id)
        console.log("Estadísticas diarias:", dailyStats)
        setStats({
          totalVisits: dailyStats.totalVisits,
          incidents: dailyStats.incidents,
          maleCount: dailyStats.maleVisits,
          femaleCount: dailyStats.femaleVisits,
        })
      }
    }
    loadStats()
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo acceder a la cámara",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (showCamera) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [showCamera, startCamera, stopCamera])

  const processImage = useCallback(
    async (imageData: string) => {
      setIsProcessing(true)
      try {
        setProcessingStep("Mejorando imagen para OCR...")
        // Mejorar la imagen para OCR
        const enhancedImage = await enhanceImageForOCR(imageData)

        setProcessingStep("Inicializando motor OCR...")
        // Initialize Tesseract.js worker
        const worker = await createWorker("spa")

        // Configurar parámetros para mejor OCR
        await worker.setParameters({
          tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyzáéíóúÁÉÍÓÚ.-",
          tessedit_pageseg_mode: "1", // Modo de segmentación automática
          tessjs_create_hocr: "0",
          tessjs_create_tsv: "0",
        })

        setProcessingStep("Extrayendo texto del documento...")
        // Perform OCR
        const {
          data: { text },
        } = await worker.recognize(enhancedImage)

        setProcessingStep("Procesando texto extraído...")
        // Process text with OpenAI
        const response = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          throw new Error("Error procesando el texto")
        }

        const result = await response.json()

        // Check if we got valid data
        if (!result.run || result.run.trim() === "") {
          setShowCriticalDataError(true)
          return
        }

        setOcrResult(result)

        // Terminate worker
        await worker.terminate()

        toast({
          title: "Documento procesado",
          description: "Se han extraído los datos del documento",
        })

        // Verificar explícitamente si el cliente está baneado después de procesar el OCR
        if (result.run) {
          setProcessingStep("Verificando estado del cliente...")
          try {
            console.log("Verificando si el cliente está baneado:", result.run)
            const existingClient = await getClientByRut(result.run)
            console.log("Resultado de la verificación:", existingClient)

            if (existingClient) {
              console.log("¿Cliente baneado?", existingClient.is_banned)

              if (existingClient.is_banned === true) {
                console.log("Cliente baneado detectado:", existingClient)
                setBannedClientData({
                  nombres: existingClient.nombres,
                  apellidos: existingClient.apellidos,
                  ban_level: existingClient.ban_level,
                  ban_reason: existingClient.ban_description,
                  banned_until: existingClient.ban_end_date,
                })

                // Asegurar que el modal se muestre
                setShowBannedClientModal(true)
              }
            }
          } catch (error) {
            console.error("Error verificando si el cliente está baneado:", error)
          }
        }
      } catch (error) {
        console.error("Error processing image:", error)
        if (error instanceof Error && error.message === "Error procesando el texto") {
          setShowCriticalDataError(true)
        } else {
          toast({
            variant: "destructive",
            title: "Error al procesar el documento",
            description: "Error al procesar el documento",
          })
        }
      } finally {
        setProcessingStep("")
        setIsProcessing(false)
      }
    },
    [toast],
  )

  const processImageWithCropping = useCallback(
    async (imageData: string) => {
      setIsProcessing(true)
      setProcessingStep("Detectando documento...")

      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = async () => {
        try {
          // Crear un canvas para procesar la imagen
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            setIsProcessing(false)
            return
          }

          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          // Detectar bordes del documento
          setProcessingStep("Recortando documento...")
          const bounds = await detectDocumentBounds(imageData)

          if (bounds) {
            // Recortar el documento
            const croppedCanvas = document.createElement("canvas")
            croppedCanvas.width = bounds.width
            croppedCanvas.height = bounds.height
            const croppedCtx = croppedCanvas.getContext("2d")

            if (croppedCtx) {
              croppedCtx.drawImage(
                canvas,
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height,
                0,
                0,
                bounds.width,
                bounds.height,
              )

              const croppedImageData = croppedCanvas.toDataURL("image/jpeg", 0.95)
              setCroppedImage(croppedImageData)

              // Extraer la cara
              setProcessingStep("Extrayendo foto del documento...")
              const croppedImageDataObj = croppedCtx.getImageData(0, 0, bounds.width, bounds.height)
              const faceImageData = await extractFace(croppedImageDataObj)

              if (faceImageData) {
                const faceCanvas = document.createElement("canvas")
                faceCanvas.width = faceImageData.width
                faceCanvas.height = faceImageData.height
                const faceCtx = faceCanvas.getContext("2d")

                if (faceCtx) {
                  faceCtx.putImageData(faceImageData, 0, 0)
                  setFaceImage(faceCanvas.toDataURL("image/jpeg", 0.95))
                }
              }

              // Procesar OCR con la imagen recortada
              await processImage(croppedImageData)
            } else {
              // Si no se puede crear el contexto, usar la imagen original
              setCroppedImage(imageData)
              await processImage(imageData)
            }
          } else {
            // Si no se detectan bordes, usar la imagen original
            setCroppedImage(imageData)
            await processImage(imageData)
          }
        } catch (error) {
          console.error("Error processing image:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error al procesar la imagen",
          })
          setIsProcessing(false)
        }
      }

      img.onerror = () => {
        console.error("Error loading image")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al cargar la imagen",
        })
        setIsProcessing(false)
      }

      img.src = imageData
    },
    [processImage, toast],
  )

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Usar las dimensiones reales del video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      canvas.width = videoWidth
      canvas.height = videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Dibujar el video en el canvas
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight)

        // Obtener la imagen como data URL con alta calidad
        const imageData = canvas.toDataURL("image/jpeg", 0.95)
        setCapturedImage(imageData)
        setShowCamera(false)

        // Procesar la imagen capturada
        processImageWithCropping(imageData)
      }
    }
  }, [processImageWithCropping])

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = e.target?.result as string
          setCapturedImage(imageData)
          processImageWithCropping(imageData)
        }
        reader.readAsDataURL(file)
      }
    },
    [processImageWithCropping],
  )

  // Modificar la función handleAccept para enviar la imagen del rostro

  const handleAccept = async () => {
    try {
      if (!ocrResult.run) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se detectó un RUT válido",
        })
        return
      }

      // Verificar explícitamente si el cliente está baneado
      console.log("Verificando si el cliente está baneado antes de aceptar:", ocrResult.run)
      const existingClient = await getClientByRut(ocrResult.run)
      console.log("Resultado de la verificación en handleAccept:", existingClient)

      // Check if client is banned
      if (existingClient) {
        console.log("¿Cliente baneado en handleAccept?", existingClient.is_banned)

        if (existingClient.is_banned === true) {
          console.log("Cliente baneado detectado en handleAccept:", existingClient)
          setBannedClientData({
            nombres: existingClient.nombres,
            apellidos: existingClient.apellidos,
            ban_level: existingClient.ban_level,
            ban_reason: existingClient.ban_reason,
            ban_description: existingClient.ban_end_date,
          })

          // Asegurar que el modal se muestre
          setShowBannedClientModal(true)
          return
        }
      }

      try {
        if (existingClient) {
          // Si el cliente existe pero no tiene imagen de documento, actualizar con la imagen actual
          if (faceImage && !existingClient.document_image) {
            await supabase.from("clients").update({ document_image: faceImage }).eq("id", existingClient.id).eq("establishment_id",currentUser.establishment_id)
          }

          await createVisit(existingClient.id)
          setSuccessAction("accept")
          setShowSuccessModal(true)
        } else {
          const birthDate = ocrResult.nacimiento ? parseSpanishDate(ocrResult.nacimiento) : null

          const newClient = await createClient(
            {
              rut: ocrResult.run,
              nombres: ocrResult.nombres,
              apellidos: ocrResult.apellidos,
              nacionalidad: ocrResult.nacionalidad,
              sexo: ocrResult.sexo as "M" | "F",
              nacimiento: birthDate,
              edad: Number.parseInt(ocrResult.edad) || null,
              establishment_id:currentUser.establishment_id
            },
            faceImage || undefined,
          )

          await createVisit(newClient.id)
          setSuccessAction("accept")
          setShowSuccessModal(true)
        }

        // Reset form
        setCapturedImage(null)
        setCroppedImage(null)
        setFaceImage(null)
        setClientType("")
        setOcrResult({
          run: "",
          apellidos: "",
          nombres: "",
          nacionalidad: "",
          sexo: "",
          nacimiento: "",
          edad: "",
        })
      } catch (visitError) {
        console.error("Error processing visit:", visitError)
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Se registró el cliente pero hubo un error al registrar la visita. Por favor, inténtelo de nuevo.",
        })
      }
    } catch (error) {
      console.error("Error processing client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar el cliente",
      })
    }
  }

  // Modificar la función handleConfirmBan para enviar la imagen del rostro
  const handleConfirmBan = async (banData: any) => {
    try {
      // Pasar los datos del cliente junto con los datos del ban
      await banClient(ocrResult.run, {
        ...banData,
        nombres: ocrResult.nombres,
        apellidos: ocrResult.apellidos,
        nacionalidad: ocrResult.nacionalidad,
        sexo: ocrResult.sexo,
        nacimiento: ocrResult.nacimiento ? parseSpanishDate(ocrResult.nacimiento) : null,
        edad: Number.parseInt(ocrResult.edad) || 0,
        document_image: faceImage || undefined,
      },currentUser)
      setSuccessAction("ban")
      setShowSuccessModal(true)

      // Reset form
      setCapturedImage(null)
      setCroppedImage(null)
      setFaceImage(null)
      setClientType("")
      setOcrResult({
        run: "",
        apellidos: "",
        nombres: "",
        nacionalidad: "",
        sexo: "",
        nacimiento: "",
        edad: "",
      })
    } catch (error) {
      console.error("Error banning client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al banear al cliente",
      })
      throw error // Re-throw to be caught by the BanModal
    }
  }

  const handleBan = () => {
    if (!ocrResult.run) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se detectó un RUT válido",
      })
      return
    }

    // Show the ban modal instead of directly banning
    setShowBanModal(true)
  }

  const handleRetry = useCallback(() => {
    setShowCriticalDataError(false)
    setShowCamera(true)
    setCapturedImage(null)
    setCroppedImage(null)
    setFaceImage(null)
    setClientType("")
    setOcrResult({
      run: "",
      apellidos: "",
      nombres: "",
      nacionalidad: "",
      sexo: "",
      nacimiento: "",
      edad: "",
    })
  }, [])

  // Add this useEffect hook after the other useEffect hooks
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [showSuccessModal])

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr,1fr,200px] gap-4 md:gap-6 h-full max-w-[1800px] mx-auto">
        {/* Columna izquierda - Escáner de documento */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 flex flex-col">
          <h2 className="text-white text-lg font-medium mb-4 md:mb-6 text-center">Documento de identidad</h2>

          <div className="relative mb-4 md:mb-6">
            <div className="aspect-[1.586] relative rounded-lg overflow-hidden bg-[#121212]">
              <div className="absolute inset-0 border-2 border-dashed border-[#3B82F6] rounded-lg" />
              {showCamera ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  <button
                    onClick={captureImage}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black font-medium py-2 px-4 rounded-full"
                  >
                    Capturar
                  </button>
                </>
              ) : croppedImage ? (
                <img
                  src={croppedImage || "/placeholder.svg"}
                  alt="Documento recortado"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-16 h-16 md:w-20 md:h-20 text-[#3B82F6] opacity-50" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4 md:mb-6">
            <button
              onClick={() => setShowCamera(true)}
              className="w-full bg-[#3B82F6] text-white py-3 rounded-lg flex items-center justify-center gap-2"
              disabled={isProcessing}
            >
              <Camera className="w-5 h-5" />
              Escanear
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-transparent text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5"
              disabled={isProcessing}
            >
              <Upload className="w-5 h-5" />
              Simular documento de prueba
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          </div>

          <div className="mt-auto">
            <h3 className="text-white text-base font-medium mb-3 text-center">Estadísticas diarias</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Ingresos" number={stats.totalVisits} />
              <StatBox label="Incidentes" number={stats.incidents} />
              <StatBox label="Mujeres" number={stats.femaleVisits} />
              <StatBox label="Hombres" number={stats.maleVisits} />
            </div>
          </div>
        </div>

        {/* Middle column - OCR Data */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 flex flex-col">
          <h2 className="text-white text-lg font-medium mb-4 md:mb-6 text-center">Datos capturados (OCR)</h2>

          {/* Face image section - always visible with placeholder when empty */}
          <div className="flex flex-col items-center mb-6">
            <div className="border-2 border-[#3B82F6] rounded-lg w-28 h-28 md:w-36 md:h-36 flex items-center justify-center overflow-hidden bg-[#121212]">
              {faceImage ? (
                <img
                  src={faceImage || "/placeholder.svg"}
                  alt="Foto del documento"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-500 opacity-50" />
              )}
            </div>

            {/* Client Type Label */}
            {clientType && (
              <div className="mt-3 w-full">
                <div
                  className={`
                  flex items-center justify-center gap-2 px-4 py-2 rounded-md
                  ${
                    clientType === "Baneado"
                      ? "bg-red-900/50 text-white border border-red-700"
                      : clientType === "Invitado"
                        ? "bg-green-900/50 text-white border border-green-700"
                        : "bg-blue-900/50 text-white border border-blue-700"
                  }
                `}
                >
                  {clientType === "Baneado" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                  )}
                  {clientType === "Invitado" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  )}
                  <span className="font-medium">Tipo de cliente: {clientType}</span>
                </div>
              </div>
            )}
          </div>

          {/* Vertical data list - styled to match the provided image */}
          <div className="flex-grow">
            <div className="space-y-[1px]">
              {[
                { key: "run", label: "Rut" },
                { key: "apellidos", label: "Apellidos" },
                { key: "nombres", label: "Nombres" },
                { key: "nacionalidad", label: "Nacionalidad" },
                { key: "sexo", label: "Sexo" },
                { key: "nacimiento", label: "Nacimiento" },
                { key: "edad", label: "Edad" },
              ].map((field) => (
                <div key={field.key} className="flex items-center bg-[#121212]/80 py-3 px-4 rounded-sm">
                  {ocrResult[field.key as keyof typeof ocrResult] ? (
                    <div className="w-4 h-4 mr-3 flex items-center justify-center text-green-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4 h-4 border border-gray-600 rounded mr-3"></div>
                  )}
                  <span className="text-[#3B82F6] text-sm font-medium min-w-[120px]">{field.label}:</span>
                  <span className="text-white text-sm">
                    {ocrResult[field.key as keyof typeof ocrResult] || "No detectado"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons for mobile */}
          <div className="flex flex-col gap-2 md:hidden mt-6">
            <h2 className="text-white text-lg font-medium mb-3 text-center">Acciones</h2>
            <button
              onClick={handleBan}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={!ocrResult.run || isProcessing}
            >
              Banear
            </button>

            <button
              onClick={handleAccept}
              className="w-full py-3 px-4 bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-colors"
              disabled={!ocrResult.run || isProcessing}
            >
              Aceptar
            </button>

            <button
              onClick={() => {
                setCapturedImage(null)
                setCroppedImage(null)
                setFaceImage(null)
                setClientType("")
                setOcrResult({
                  run: "",
                  apellidos: "",
                  nombres: "",
                  nacionalidad: "",
                  sexo: "",
                  nacimiento: "",
                  edad: "",
                })
              }}
              className="w-full py-3 px-4 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={() => setShowEmergency(true)}
              className="w-full py-3 px-4 bg-[#EAB308] text-black font-bold rounded-lg hover:bg-[#CA8A04] transition-colors mt-2"
            >
              Emergencia
            </button>
          </div>
        </div>

        {/* Right column - Actions (desktop only) */}
        <div className="hidden lg:flex flex-col gap-3">
          <h2 className="text-white text-lg font-medium mb-4 text-center">Acciones</h2>
          <button
            onClick={handleBan}
            className="w-full py-4 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            disabled={!ocrResult.run || isProcessing}
          >
            Banear
          </button>

          <button
            onClick={handleAccept}
            className="w-full py-4 px-6 bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-colors"
            disabled={!ocrResult.run || isProcessing}
          >
            Aceptar
          </button>

          <button
            onClick={() => {
              setCapturedImage(null)
              setCroppedImage(null)
              setFaceImage(null)
              setClientType("")
              setOcrResult({
                run: "",
                apellidos: "",
                nombres: "",
                nacionalidad: "",
                sexo: "",
                nacimiento: "",
                edad: "",
              })
            }}
            className="w-full py-4 px-6 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={() => setShowEmergency(true)}
            className="w-full py-4 px-6 bg-[#EAB308] text-black font-bold rounded-lg hover:bg-[#CA8A04] transition-colors mt-auto"
          >
            Emergencia
          </button>
        </div>
      </div>

      {/* Ban Modal */}
      <BanModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleConfirmBan}
        clientRut={ocrResult.run}
      />

      {/* Banned Client Modal */}
      <BannedClientModal
        isOpen={showBannedClientModal}
        onClose={() => setShowBannedClientModal(false)}
        clientData={bannedClientData}
      />

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#1A1B1C] border-[#3F3F46] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-center text-white text-xl">
              {successAction === "ban" ? "Cliente Baneado" : "Cliente Aceptado"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {successAction === "ban" ? (
              <>
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <p className="text-white text-center">El cliente ha sido baneado exitosamente del sistema.</p>
              </>
            ) : (
              <>
                <div className="bg-green-500/10 p-4 rounded-full mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-white text-center">
                  El cliente ha sido aceptado exitosamente y su visita ha sido registrada.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CriticalDataDialog
        isOpen={showCriticalDataError}
        onClose={() => setShowCriticalDataError(false)}
        onRetry={handleRetry}
      />

      <EmergencyPopup isOpen={showEmergency} onClose={() => setShowEmergency(false)} />

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] p-6 md:p-8 rounded-xl flex flex-col items-center max-w-md">
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-t-[#3B82F6] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-white text-lg md:text-xl font-medium mb-2">Procesando documento</h3>
            <p className="text-gray-400 text-center text-sm md:text-base">
              {processingStep || "Extrayendo información mediante OCR. Esto puede tomar unos segundos..."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({ label, number }: { label: string; number: number }) {
  return (
    <div className="bg-[#121212] rounded-lg p-3">
      <div className="text-xl md:text-2xl font-bold text-white mb-1">{number}</div>
      <div className="text-xs md:text-sm text-[#3B82F6]">{label}</div>
    </div>
  )
}

