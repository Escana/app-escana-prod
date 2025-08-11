import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Implementación del logger mejorado
export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[DEBUG]", ...args)
    }
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : "")
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data ? JSON.stringify(data) : "")
  },
}

// Mantener la función logNavigation que se usa en otras partes de la aplicación
export const logNavigation = (from: string, to: string) => {
  logger.info(`Navigation: ${from} -> ${to}`)
}

