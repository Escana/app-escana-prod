"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getSession() {
      try {
        // Primero intentar obtener la sesión de la cookie
        const response = await fetch("/api/auth/session")
        const data = await response.json()

        if (data.session) {
          setSession(data.session)
          return
        }

        // Si no hay sesión en la cookie, intentar con Supabase
        const {
          data: { session: supabaseSession },
        } = await supabase.auth.getSession()
        setSession(supabaseSession)
      } catch (error) {
        console.error("Error al obtener la sesión:", error)
      } finally {
        setLoading(false)
      }
    }

    getSession()
  }, [])

  return { session, loading }
}

