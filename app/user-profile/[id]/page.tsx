"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getUserProfile, canViewFullProfile } from "@/lib/user-profile"
import type { CompleteUserProfile } from "@/types/user-profile"
import { AdminUserProfileView } from "@/components/user-profile/admin-user-profile-view"
import { GuardUserProfileView } from "@/components/user-profile/guard-user-profile-view"
import { getCurrentUser, ROLES } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<CompleteUserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Obtener el usuario actual
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (!user) {
          setError("No se ha iniciado sesión")
          router.push("/login")
          return
        }

        // Obtener el ID del perfil a mostrar
        const profileId = params.id as string

        // Si no es el propio perfil, verificar permisos
        if (profileId !== user.id) {
          // Obtener el perfil solicitado para verificar su rol
          const targetProfile = await getUserProfile(profileId)

          if (!targetProfile) {
            setError("Perfil no encontrado")
            return
          }

          // Verificar si puede ver el perfil completo
          const canView = canViewFullProfile(user.role, targetProfile.role)

          if (!canView) {
            setError("No tienes permiso para ver este perfil")
            router.push("/")
            return
          }

          setProfile(targetProfile)
        } else {
          // Es el propio perfil
          const userProfile = await getUserProfile(user.id)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        setError("Error al cargar el perfil")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Cargando perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "No se pudo cargar el perfil"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determinar si es el propio perfil del usuario
  const isOwnProfile = currentUser?.id === profile.id

  // Determinar qué vista mostrar según el rol
  if (currentUser?.role === ROLES.GUARDIA) {
    return <GuardUserProfileView profile={profile} />
  } else {
    return <AdminUserProfileView profile={profile} isOwnProfile={isOwnProfile} />
  }
}

