"use client"

import type React from "react"

import { ErrorBoundary } from "react-error-boundary"
import { ErrorFallback } from "./error-fallback"

export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
}

