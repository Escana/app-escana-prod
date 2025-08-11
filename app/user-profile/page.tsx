"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"

// Esta página redirige al perfil del usuario actual
export default function UserProfileRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirectToUserProfile() {
      try {
        const user = await getCurrentUser()

        if (user && user.id) {
          router.push(`/user-profile/${user.id}`)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error redirecting to user profile:", error)
        router.push("/login")
      }
    }

    redirectToUserProfile()
  }, [router])

  return (
    <div className="container mx-auto py-10 flex items-center justify-center">
      <p>Redirigiendo a tu perfil...</p>
    </div>
  )
}

