const SPANISH_MONTHS: { [key: string]: string } = {
  ENE: "01",
  FEB: "02",
  MAR: "03",
  ABR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AGO: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DIC: "12",
}

export function parseSpanishDate(dateStr: string): string | null {
  try {
    // Validate input
    if (!dateStr) {
      console.error("Date string is undefined or empty")
      return null
    }

    // Split the date components (expecting format like "14 AGO 1994")
    const parts = dateStr.trim().split(" ")
    if (parts.length !== 3) {
      console.error("Invalid date format. Expected DD MMM YYYY")
      return null
    }

    const [day, monthStr, year] = parts

    // Convert month abbreviation to number
    const month = SPANISH_MONTHS[monthStr.toUpperCase()]
    if (!month) {
      console.error("Invalid month abbreviation:", monthStr)
      return null
    }

    // Validate day, month, and year
    const dayNum = Number.parseInt(day, 10)
    const yearNum = Number.parseInt(year, 10)

    if (dayNum < 1 || dayNum > 31 || yearNum < 1900) {
      console.error("Invalid date values")
      return null
    }

    // Pad day with leading zeros if necessary
    const paddedDay = day.padStart(2, "0")

    // Return ISO format YYYY-MM-DD
    return `${year}-${month}-${paddedDay}`
  } catch (error) {
    console.error("Error parsing date:", error)
    return null
  }
}

export function calculateAge(birthDate: string): number | null {
  try {
    const birth = new Date(birthDate)
    const today = new Date()

    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  } catch (error) {
    console.error("Error calculating age:", error)
    return null
  }
}

