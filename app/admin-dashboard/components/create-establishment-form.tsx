"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { getUserId, isAuthenticated, isSuperAdmin } from "@/lib/auth-utils"

export function CreateEstablishmentForm() {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const superAdmin = isSuperAdmin()

      setDebugInfo((prev) => ({
        ...prev,
        authState: {
          authenticated,
          superAdmin,
          userId: getUserId(),
        },
      }))

      setAuthChecked(true)

      if (!authenticated) {
        setError("User not authenticated. Please log in again.")
      } else if (!superAdmin) {
        setError("Only SUPERADMIN users can create establishments.")
      }
    }

    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated() || !isSuperAdmin()) {
      setError("Authentication or permission issue. Please log in again as SUPERADMIN.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userId = getUserId()

      if (!userId) {
        throw new Error("User ID not found in localStorage")
      }

      console.log("Creating establishment with user ID:", userId)

      // First, check if the establishment already exists
      const { data: existingEstablishment, error: checkError } = await supabase
        .from("establishments")
        .select("id")
        .eq("name", name)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking establishment:", checkError)
        throw new Error(`Error checking establishment: ${checkError.message}`)
      }

      if (existingEstablishment) {
        setError("An establishment with this name already exists")
        return
      }

      // Insert the new establishment
      const newEstablishment = {
        name,
        address,
        city,
        created_by: userId,
      }

      console.log("Inserting establishment:", newEstablishment)

      const { data, error: insertError } = await supabase.from("establishments").insert([newEstablishment]).select()

      if (insertError) {
        console.error("Error inserting establishment:", insertError)

        // Get more debug info
        const { data: authData, error: authError } = await supabase.auth.getSession()
        const { data: roles } = await supabase.from("user_roles").select("*").eq("user_id", userId)

        setDebugInfo({
          localUser: { id: userId },
          supabaseAuth: { data: authData, error: authError },
          roles,
          error: insertError,
        })

        throw new Error(`Error creating establishment: ${insertError.message}`)
      }

      toast({
        title: "Success",
        description: "Establishment created successfully",
      })

      // Refresh the page data
      router.refresh()

      // Reset form
      setName("")
      setAddress("")
      setCity("")
    } catch (err) {
      console.error("Error in create establishment:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Establishment</CardTitle>
        <CardDescription>Add a new establishment to the system</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!authChecked ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Checking authentication...</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Establishment Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter establishment name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Enter address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Enter city"
                />
              </div>
            </>
          )}

          {debugInfo && (
            <div className="bg-slate-50 p-3 rounded-md text-xs overflow-auto max-h-60">
              <strong>Debug Info:</strong>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading || !authChecked || !!error}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Establishment"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

