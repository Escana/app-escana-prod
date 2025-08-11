// Helper functions for authentication with localStorage

export const getLocalUser = () => {
  if (typeof window === "undefined") return null

  try {
    const userString = localStorage.getItem("user")
    if (!userString) return null

    return JSON.parse(userString)
  } catch (error) {
    console.error("Error parsing user from localStorage:", error)
    return null
  }
}

export const getLocalToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export const getUserId = () => {
  const user = getLocalUser()
  return user?.id || null
}

export const getUserRole = () => {
  const user = getLocalUser()
  return user?.role || null
}

export const isSuperAdmin = () => {
  return getUserRole() === "SUPERADMIN"
}

export const isAuthenticated = () => {
  return !!getLocalToken() && !!getLocalUser()
}

