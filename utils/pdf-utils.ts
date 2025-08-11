import { PDFDocument } from "pdf-lib"

export async function convertImageToPDF(imageData: string): Promise<Uint8Array> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
    const imageBytes = Buffer.from(base64Data, "base64")

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Determine image type and embed it
    let image
    if (imageData.includes("data:image/png")) {
      image = await pdfDoc.embedPng(imageBytes)
    } else {
      image = await pdfDoc.embedJpg(imageBytes)
    }

    // Add a page with the image
    const page = pdfDoc.addPage([image.width, image.height])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })

    // Compress and optimize the PDF
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false, // Better compression
      addDefaultPage: false,
      compress: true,
    })

    return pdfBytes
  } catch (error) {
    console.error("Error converting image to PDF:", error)
    throw new Error("Failed to convert image to PDF")
  }
}

export function checkFileSize(data: Uint8Array): boolean {
  const sizeInMB = data.length / (1024 * 1024)
  return sizeInMB <= 1
}

