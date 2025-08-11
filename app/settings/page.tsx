"use client"

import { useState, useEffect } from "react"
import { Save, HelpCircle, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const mockSettings = {
  theme: "dark",
  fontSize: 16,
  language: "es",
  notificationSound: true,
  autoScan: true,
  emergencyContact: "+56 9 1234 5678",
  securityNumber: "", // Add this line
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const handleChange = (key: string, value: any) => {
    if (key === "theme") {
      setTheme(value as "dark" | "light")
    }
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    console.log("Saving settings:", { ...settings, theme })
    // Here you would typically send the updated settings to your backend
  }

  return (
    <div className="min-h-screen bg-[#1A1B1C] p-8">
      <div className="max-w-4xl mx-auto bg-[#27272A] rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">Configuración</h1>
            <Button
              onClick={handleSave}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all duration-300 ease-in-out"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar Cambios
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appearance Settings */}
            <div className="bg-[#2A2A2A] p-4 rounded-lg space-y-3">
              <h2 className="text-xl font-semibold text-white mb-3">Apariencia</h2>
              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="themeToggle" className="text-white">
                  {theme === "dark" ? "Modo oscuro" : "Modo claro"}
                </Label>
                <Switch
                  id="themeToggle"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  className="bg-[#6B7280] data-[state=checked]:bg-[#3B82F6]"
                />
              </div>
              {/* Font size */}
              <div className="space-y-2">
                <Label htmlFor="fontSize" className="text-white">
                  Tamaño de fuente
                </Label>
                <Select
                  value={settings.fontSize.toString()}
                  onValueChange={(value) => handleChange("fontSize", Number(value))}
                >
                  <SelectTrigger id="fontSize" className="bg-[#3F3F46] border-0 text-white">
                    <SelectValue placeholder="Seleccionar tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    {[12, 14, 16, 18, 20].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-white">
                  Idioma
                </Label>
                <Select value={settings.language} onValueChange={(value) => handleChange("language", value)}>
                  <SelectTrigger id="language" className="bg-[#3F3F46] border-0 text-white">
                    <SelectValue placeholder="Seleccionar idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Account and Security Settings */}
            <div className="bg-[#2A2A2A] p-4 rounded-lg space-y-3">
              <h2 className="text-xl font-semibold text-white mb-3">Cuenta y Seguridad</h2>
              {/* Emergency contact */}
              <div className="space-y-2">
                <Label htmlFor="emergencyContact" className="text-white">
                  Contacto de emergencia
                </Label>
                <Input
                  id="emergencyContact"
                  type="tel"
                  value={settings.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  className="bg-[#3F3F46] border-0 text-white"
                />
              </div>
              {/* Security number */}
              <div className="space-y-2">
                <Label htmlFor="securityNumber" className="text-white">
                  Número de seguridad (verificación en dos pasos)
                </Label>
                <Input
                  id="securityNumber"
                  type="password"
                  value={settings.securityNumber}
                  onChange={(e) => handleChange("securityNumber", e.target.value)}
                  className="bg-[#3F3F46] border-0 text-white"
                  placeholder="••••••"
                />
              </div>
            </div>

            {/* Notification and Scanning Settings */}
            <div className="bg-[#2A2A2A] p-4 rounded-lg space-y-3">
              <h2 className="text-xl font-semibold text-white mb-3">Notificaciones y Escaneo</h2>
              {/* Notification sound */}
              <div className="flex items-center justify-between">
                <Label htmlFor="notificationSound" className="text-white">
                  Sonido de notificaciones
                </Label>
                <Switch
                  id="notificationSound"
                  checked={settings.notificationSound}
                  onCheckedChange={(checked) => handleChange("notificationSound", checked)}
                  className="bg-[#6B7280] data-[state=checked]:bg-[#3B82F6]"
                />
              </div>
              {/* Auto scan */}
              <div className="flex items-center justify-between">
                <Label htmlFor="autoScan" className="text-white">
                  Escaneo automático
                </Label>
                <Switch
                  id="autoScan"
                  checked={settings.autoScan}
                  onCheckedChange={(checked) => handleChange("autoScan", checked)}
                  className="bg-[#6B7280] data-[state=checked]:bg-[#3B82F6]"
                />
              </div>
            </div>
          </div>

          {/* Help and Tutorial Section */}
          <div className="mt-6 bg-[#1A2B41] p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-3">¿Necesita más información?</h2>
            <p className="text-gray-300 mb-3">
              Si necesita ayuda adicional o quiere aprender más sobre cómo usar la aplicación, visite nuestras secciones
              de ayuda y tutorial.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center gap-2">
                <Link href="/help">
                  <HelpCircle className="w-4 h-4" />
                  Ir a Ayuda
                </Link>
              </Button>
              <Button asChild className="bg-[#22C55E] hover:bg-[#16A34A] text-white flex items-center gap-2">
                <Link href="/tutorial">
                  <BookOpen className="w-4 h-4" />
                  Ir a Tutorial
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

