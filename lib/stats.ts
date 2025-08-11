import type { StatsData, TimeFilter } from "@/types/stats"

export async function getStatsData(filter: TimeFilter = "30d"): Promise<StatsData> {
  // TODO: Replace with actual Supabase queries
  return generateRandomData(filter)
}

function generateRandomData(filter: TimeFilter): StatsData {
  const baseData = {
    attendanceData: {
      female: { count: Math.floor(Math.random() * 5000) + 2000, change: `${(Math.random() * 20 - 10).toFixed(1)}%` },
      male: { count: Math.floor(Math.random() * 5000) + 2000, change: `${(Math.random() * 20 - 10).toFixed(1)}%` },
    },
    incidentsData: {
      total: { count: Math.floor(Math.random() * 50), change: `${(Math.random() * 20 - 10).toFixed(1)}%` },
      bans: { count: Math.floor(Math.random() * 20), change: `${(Math.random() * 20 - 10).toFixed(1)}%` },
    },
    nationalityData: {
      chilean: Math.floor(Math.random() * 8000) + 4000,
      foreign: Math.floor(Math.random() * 2000) + 500,
    },
    monthlyScans: Math.floor(Math.random() * 10000) + 5000,
    ageDistribution: [
      { name: "18-25", male: Math.floor(Math.random() * 500) + 200, female: Math.floor(Math.random() * 400) + 200 },
      { name: "26-35", male: Math.floor(Math.random() * 700) + 300, female: Math.floor(Math.random() * 600) + 300 },
      { name: "36-45", male: Math.floor(Math.random() * 400) + 200, female: Math.floor(Math.random() * 300) + 200 },
      { name: "46-55", male: Math.floor(Math.random() * 200) + 100, female: Math.floor(Math.random() * 200) + 100 },
      { name: "56+", male: Math.floor(Math.random() * 100) + 50, female: Math.floor(Math.random() * 100) + 50 },
    ],
  }

  const getRandomWeekdayData = () => [
    { day: "LUN", count: Math.floor(Math.random() * 1000) + 200 },
    { day: "MAR", count: Math.floor(Math.random() * 1000) + 200 },
    { day: "MIÉ", count: Math.floor(Math.random() * 1000) + 200 },
    { day: "JUE", count: Math.floor(Math.random() * 1000) + 200 },
    { day: "VIE", count: Math.floor(Math.random() * 1500) + 500 },
    { day: "SÁB", count: Math.floor(Math.random() * 2000) + 1000 },
    { day: "DOM", count: Math.floor(Math.random() * 1500) + 500 },
  ]

  switch (filter) {
    case "24h":
      return {
        ...baseData,
        weekdayAttendance: [getRandomWeekdayData()[new Date().getDay()]],
        monthlyData: [{ month: "Hoy", scans: Math.floor(Math.random() * 1000) + 500 }],
      }
    case "7d":
      return {
        ...baseData,
        weekdayAttendance: getRandomWeekdayData(),
        monthlyData: Array.from({ length: 7 }, (_, i) => ({
          month: `Día ${i + 1}`,
          scans: Math.floor(Math.random() * 1000) + 500,
        })),
      }
    case "30d":
      return {
        ...baseData,
        weekdayAttendance: getRandomWeekdayData(),
        monthlyData: Array.from({ length: 30 }, (_, i) => ({
          month: `Día ${i + 1}`,
          scans: Math.floor(Math.random() * 1000) + 500,
        })),
      }
    case "12m":
      return {
        ...baseData,
        weekdayAttendance: getRandomWeekdayData(),
        monthlyData: Array.from({ length: 12 }, (_, i) => ({
          month: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
          scans: Math.floor(Math.random() * 10000) + 5000,
        })),
      }
    default:
      return {
        ...baseData,
        weekdayAttendance: getRandomWeekdayData(),
        monthlyData: Array.from({ length: 12 }, (_, i) => ({
          month: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
          scans: Math.floor(Math.random() * 10000) + 5000,
        })),
      }
  }
}

