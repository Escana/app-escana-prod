import type * as React from "react"

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: "default" | "destructive"
}

type ToastActionElement = React.ReactNode

export { ToastProvider }

export type { ToastProps, ToastActionElement }

