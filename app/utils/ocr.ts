export const getBaseUrl = () => {
  const baseUrl =
    typeof window !== "undefined"
      ? "" // browser should use relative url
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}` // SSR should use vercel url
        : "http://localhost:3000" // dev SSR should use localhost

  console.log("Base URL for OCR:", baseUrl)
  return baseUrl
}

export const processOCRWithRetry = async (imageData: string, maxRetries = 3) => {
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      console.log(`[OCR Attempt ${attempts + 1}] Starting OCR processing...`)

      const url = `${getBaseUrl()}/api/ocr`
      console.log("[OCR] Using URL:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: imageData }),
      })

      console.log("[OCR] Response status:", response.status)
      console.log("[OCR] Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[OCR] Received data:", data)

      if (!data || !data.run) {
        console.warn(`[OCR Attempt ${attempts + 1}] No valid data received:`, data)
        attempts++
        continue
      }

      return data
    } catch (error) {
      console.error(`[OCR Attempt ${attempts + 1}] Failed:`, error)
      attempts++

      if (attempts === maxRetries) {
        console.error("[OCR] All retry attempts failed")
        throw new Error("No se pudo procesar el documento después de múltiples intentos")
      }

      console.log(`[OCR] Waiting ${attempts} seconds before retry...`)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
    }
  }

  throw new Error("No se pudo procesar el documento")
}

