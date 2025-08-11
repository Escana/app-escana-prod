// app/layout.tsx
import React from "react"
import { Poppins } from "next/font/google"
import { ErrorBoundaryWrapper } from "./components/error-boundary-wrapper"
import { MainNav } from "./components/main-nav"
import { StatusBar, StatusBarProvider } from "./components/status-bar"
import Providers from "./providers"
import { logger } from "@/lib/utils"
import { ToastProvider } from "@/components/ui/toast"



// Import global styles
import "@/styles/globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata = {
  generator: "Creado por CloudHub",
  title: "Escana",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  logger.info("Rendering root layout")

  return (
    <html lang="es" className="dark">
      <body className={poppins.className}>
        <Providers>
            <StatusBarProvider>
              <ErrorBoundaryWrapper>
                <div className="min-h-screen bg-[#1A1B1C] flex flex-col">
                  <MainNav />
                  
                  <main className="flex-grow">
                    <ToastProvider>{children}
                    </ToastProvider>
                    </main>
                
                  <StatusBar />
                </div>
              </ErrorBoundaryWrapper>
            </StatusBarProvider>
            {/* Don’t forget the viewport: it actually renders the toasts */}
        </Providers>
      </body>
    </html>
  )
}
