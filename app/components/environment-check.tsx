"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export function EnvironmentCheck() {
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<{
    openai: boolean | null
    supabase: boolean | null
    message: string
  }>({
    openai: null,
    supabase: null,
    message: "",
  })

  const checkEnvironment = async () => {
    setChecking(true)
    setResults({
      openai: null,
      supabase: null,
      message: "Verificando configuración...",
    })

    try {
      // Check OpenAI configuration
      const ocrResponse = await fetch("/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "TEST RUN: 12.345.678-9 APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2 CHILENA M 01 ENE 1990 01 ENE 2030",
        }),
      })

      const ocrData = await ocrResponse.json()
      const openaiWorking = !ocrData.error && ocrData.run

      // Check Supabase configuration
      let supabaseWorking = false
      try {
        if (typeof window !== "undefined") {
          supabaseWorking = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        }
      } catch (e) {
        console.error("Error checking Supabase:", e)
      }

      setResults({
        openai: openaiWorking,
        supabase: supabaseWorking,
        message:
          openaiWorking && supabaseWorking
            ? "Configuración correcta para ambos servicios."
            : "Hay problemas con la configuración.",
      })
    } catch (error) {
      console.error("Error checking environment:", error)
      setResults({
        openai: false,
        supabase: false,
        message: `Error al verificar la configuración: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verificación de Entorno</CardTitle>
        <CardDescription>Verifica que la configuración de OpenAI y Supabase esté correcta</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>OpenAI API:</span>
            {results.openai === null ? (
              <span className="text-gray-400">No verificado</span>
            ) : results.openai ? (
              <span className="flex items-center text-green-500">
                <CheckCircle className="w-4 h-4 mr-1" /> Configurado
              </span>
            ) : (
              <span className="flex items-center text-red-500">
                <AlertCircle className="w-4 h-4 mr-1" /> Error
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Supabase:</span>
            {results.supabase === null ? (
              <span className="text-gray-400">No verificado</span>
            ) : results.supabase ? (
              <span className="flex items-center text-green-500">
                <CheckCircle className="w-4 h-4 mr-1" /> Configurado
              </span>
            ) : (
              <span className="flex items-center text-red-500">
                <AlertCircle className="w-4 h-4 mr-1" /> Error
              </span>
            )}
          </div>

          {results.message && <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">{results.message}</div>}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={checkEnvironment} disabled={checking} className="w-full">
          {checking ? "Verificando..." : "Verificar Configuración"}
        </Button>
      </CardFooter>
    </Card>
  )
}

