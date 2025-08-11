export async function detectDocumentBounds(
  imageData: ImageData,
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  const { data, width, height } = imageData
  const threshold = 40 // Aumentado para mejor detección en condiciones variables
  const edges = new Uint8Array(width * height)

  // Preprocesamiento - Convertir a escala de grises para mejor detección
  const grayscale = new Uint8Array(width * height)
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const idx = (i * width + j) * 4
      // Convertir RGB a escala de grises usando pesos estándar
      grayscale[i * width + j] = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2])
    }
  }

  // Detectar bordes usando diferencias de intensidad en escala de grises
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pos = y * width + x
      const left = y * width + (x - 1)
      const right = y * width + (x + 1)
      const top = (y - 1) * width + x
      const bottom = (y + 1) * width + x

      // Calcular diferencias en escala de grises
      const dx = Math.abs(grayscale[left] - grayscale[right])
      const dy = Math.abs(grayscale[top] - grayscale[bottom])

      edges[pos] = dx + dy > threshold ? 255 : 0
    }
  }

  // Aplicar dilatación para conectar bordes cercanos
  const dilated = new Uint8Array(width * height)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pos = y * width + x
      // Si algún pixel vecino es borde, este también lo es
      dilated[pos] =
        edges[pos] || edges[pos - 1] || edges[pos + 1] || edges[pos - width] || edges[pos + width] ? 255 : 0
    }
  }

  // Encontrar los límites del documento usando el mapa de bordes dilatado
  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0
  let found = false

  // Buscar los bordes más externos
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (dilated[y * width + x] === 255) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
        found = true
      }
    }
  }

  if (!found) {
    // Si no se detectaron bordes, intentar con la proporción típica de un carnet
    // La mayoría de los carnets tienen una proporción aproximada de 1.586 (ancho/alto)
    const targetRatio = 1.586
    const centerX = width / 2
    const centerY = height / 2

    // Estimar un tamaño razonable basado en las dimensiones de la imagen
    const estimatedHeight = Math.min(height * 0.7, 600)
    const estimatedWidth = estimatedHeight * targetRatio

    return {
      x: Math.max(0, Math.floor(centerX - estimatedWidth / 2)),
      y: Math.max(0, Math.floor(centerY - estimatedHeight / 2)),
      width: Math.min(width, Math.floor(estimatedWidth)),
      height: Math.min(height, Math.floor(estimatedHeight)),
    }
  }

  // Verificar si las dimensiones detectadas son razonables para un carnet
  // Si son muy pequeñas o muy grandes, ajustar
  const detectedWidth = maxX - minX
  const detectedHeight = maxY - minY
  const detectedRatio = detectedWidth / detectedHeight

  // Si la proporción detectada está muy lejos de la esperada para un carnet,
  // o si el área detectada es muy pequeña, usar estimación
  if (detectedRatio < 1.2 || detectedRatio > 2.0 || detectedWidth < width * 0.2 || detectedHeight < height * 0.2) {
    const targetRatio = 1.586
    const centerX = width / 2
    const centerY = height / 2

    // Estimar un tamaño razonable basado en las dimensiones de la imagen
    const estimatedHeight = Math.min(height * 0.7, 600)
    const estimatedWidth = estimatedHeight * targetRatio

    return {
      x: Math.max(0, Math.floor(centerX - estimatedWidth / 2)),
      y: Math.max(0, Math.floor(centerY - estimatedHeight / 2)),
      width: Math.min(width, Math.floor(estimatedWidth)),
      height: Math.min(height, Math.floor(estimatedHeight)),
    }
  }

  // Añadir margen
  const margin = 20
  return {
    x: Math.max(0, minX - margin),
    y: Math.max(0, minY - margin),
    width: Math.min(width - minX, maxX - minX + 2 * margin),
    height: Math.min(height - minY, maxY - minY + 2 * margin),
  }
}

export async function extractFace(imageData: ImageData): Promise<ImageData | null> {
  // Región aproximada donde suele estar la foto en un carnet chileno
  // Ajustado para ser más preciso en la detección de la cara
  const faceRegion = {
    x: Math.floor(imageData.width * 0.05),
    y: Math.floor(imageData.height * 0.2),
    width: Math.floor(imageData.width * 0.3),
    height: Math.floor(imageData.height * 0.5),
  }

  const canvas = document.createElement("canvas")
  canvas.width = faceRegion.width
  canvas.height = faceRegion.height
  const ctx = canvas.getContext("2d")

  if (!ctx) return null

  const tempCanvas = document.createElement("canvas")
  tempCanvas.width = imageData.width
  tempCanvas.height = imageData.height
  const tempCtx = tempCanvas.getContext("2d")

  if (!tempCtx) return null

  tempCtx.putImageData(imageData, 0, 0)

  ctx.drawImage(
    tempCanvas,
    faceRegion.x,
    faceRegion.y,
    faceRegion.width,
    faceRegion.height,
    0,
    0,
    faceRegion.width,
    faceRegion.height,
  )

  return ctx.getImageData(0, 0, faceRegion.width, faceRegion.height)
}

// Nueva función para mejorar la calidad de la imagen antes del OCR
export async function enhanceImageForOCR(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        resolve(imageData)
        return
      }

      // Dibujar la imagen original
      ctx.drawImage(img, 0, 0)

      // Obtener los datos de la imagen
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      // Aplicar mejoras para OCR
      for (let i = 0; i < data.length; i += 4) {
        // Aumentar contraste
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        if (avg > 127) {
          data[i] = Math.min(255, data[i] * 1.2)
          data[i + 1] = Math.min(255, data[i + 1] * 1.2)
          data[i + 2] = Math.min(255, data[i + 2] * 1.2)
        } else {
          data[i] = Math.max(0, data[i] * 0.8)
          data[i + 1] = Math.max(0, data[i + 1] * 0.8)
          data[i + 2] = Math.max(0, data[i + 2] * 0.8)
        }
      }

      // Poner los datos mejorados de vuelta en el canvas
      ctx.putImageData(imgData, 0, 0)

      // Devolver la imagen mejorada como data URL
      resolve(canvas.toDataURL("image/jpeg", 0.95))
    }

    img.src = imageData
  })
}

