"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const supabase = createClientComponentClient()

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser()

      // Check establishments table
      const { data: establishments, error: establishmentsError } = await supabase
        .from("establishments")
        .select("count")
        .single()

      // Check user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userData.user?.id || "")

      // Check RLS is working
      const { data: rlsTest, error: rlsError } = await supabase
        .from("establishments")
        .insert([
          {
            name: "Test Establishment " + new Date().toISOString(),
            address: "Test Address",
            city: "Test City",
            created_by: userData.user?.id,
          },
        ])
        .select()

      setDebugInfo({
        user: userData.user,
        establishments,
        establishmentsError,
        userRoles,
        userRolesError,
        rlsTest,
        rlsError,
      })
    } catch (error) {
      console.error("Debug error:", error)
      setDebugInfo({ error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? "Hide Debug Info" : "Show Debug Info"}
      </Button>

      {showDebug && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDebugInfo} disabled={loading} variant="secondary" className="mb-4">
              {loading ? "Loading..." : "Fetch Debug Info"}
            </Button>

            {debugInfo && (
              <pre className="bg-slate-100 p-4 rounded-md overflow-auto max-h-96 text-xs">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

