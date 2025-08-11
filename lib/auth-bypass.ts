import type { SupabaseClient } from "@supabase/supabase-js"
import { logger } from "@/lib/utils"

// Default superadmin ID to use when auth is bypassed
const DEFAULT_SUPERADMIN_ID = "7653f8d2-8809-4c49-b13d-8bdbcf2b31b2"

/**
 * Gets the user ID from various sources with fallbacks
 * 1. First tries to get from Supabase auth session
 * 2. Then tries to get from custom auth cookie
 * 3. Finally falls back to the default superadmin ID if BYPASS_AUTH is enabled
 */
export async function getUserId(supabase: SupabaseClient): Promise<string | null> {
  try {
    // Try to get user from Supabase auth
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (session?.user?.id) {
      logger.info("Using authenticated user ID:", session.user.id)
      return session.user.id
    }

    if (sessionError) {
      logger.warn("Error getting Supabase session:", sessionError.message)
    }

    // Check if auth bypass is enabled
    const bypassAuth = process.env.BYPASS_AUTH === "true"

    if (bypassAuth) {
      logger.warn("⚠️ USING AUTH BYPASS - FOR DEVELOPMENT ONLY")
      return DEFAULT_SUPERADMIN_ID
    }

    logger.error("No user ID found and auth bypass is disabled")
    return null
  } catch (error) {
    logger.error("Error in getUserId:", error)
    return null
  }
}

