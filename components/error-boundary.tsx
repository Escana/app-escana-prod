"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-xl font-bold mb-2">Ha ocurrido un error</h2>
              <p className="text-gray-400">Por favor, intente de nuevo más tarde</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB]"
              >
                Reintentar
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

