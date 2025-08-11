"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { logger, logNavigation } from "@/lib/utils"


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      onError: (error) => {
        logger.error("Query error:", error)
      },
    },
    mutations: {
      onError: (error) => {
        logger.error("Mutation error:", error)
      },
    },
  },
})

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Log navigation
  useEffect(() => {
    logNavigation("previous", pathname)
  }, [pathname])

  // Log app initialization
  useEffect(() => {
    logger.info("App initialized")

    // Enable persistent logs
    if (typeof window !== "undefined") {
      const originalConsole = { ...console }
      const maxLogs = 1000
      const logs: string[] = []

      const persistLog = (type: string, args: any[]) => {
        try {
          const log = `[${new Date().toISOString()}] [${type}] ${args
            .map((arg) => {
              if (arg === null) return "null"
              if (arg === undefined) return "undefined"
              if (typeof arg === "number" && Number.isNaN(arg)) return "NaN"
              if (typeof arg === "object") {
                try {
                  return JSON.stringify(arg)
                } catch (e) {
                  return String(arg)
                }
              }
              return String(arg)
            })
            .join(" ")}`

          logs.push(log)
          if (logs.length > maxLogs) logs.shift()

          // Store logs in session storage
          try {
            sessionStorage.setItem("app_logs", JSON.stringify(logs))
          } catch (e) {
            originalConsole.error("Error storing logs:", e)
          }

          // Call original console method
          originalConsole[type.toLowerCase()](...args)
        } catch (error) {
          originalConsole.error("Error in persistLog:", error)
        }
      }

      // Override console methods
      console.log = (...args) => persistLog("LOG", args)
      console.info = (...args) => persistLog("INFO", args)
      console.warn = (...args) => persistLog("WARN", args)
      console.error = (...args) => persistLog("ERROR", args)
      console.debug = (...args) => persistLog("DEBUG", args)

      // Restore logs from session storage
      try {
        const storedLogs = sessionStorage.getItem("app_logs")
        if (storedLogs) {
          const parsedLogs = JSON.parse(storedLogs)
          parsedLogs.forEach((log: string) => originalConsole.log(log))
        }
      } catch (e) {
        originalConsole.error("Error restoring logs:", e)
      }

      // Cleanup
      return () => {
        console.log = originalConsole.log
        console.info = originalConsole.info
        console.warn = originalConsole.warn
        console.error = originalConsole.error
        console.debug = originalConsole.debug
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

