export type TimeFilter = "24h" | "7d" | "30d" | "12m"

export interface StatsData {
  attendanceData: {
    female: { count: number; change: string }
    male: { count: number; change: string }
  }
  incidentsData: {
    total: { count: number; change: string }
    bans: { count: number; change: string }
  }
  nationalityData: {
    chilean: number
    foreign: number
  }
  monthlyScans: number
  ageDistribution: Array<{
    name: string
    male: number
    female: number
  }>
  weekdayAttendance: Array<{
    day: string
    count: number
  }>
  monthlyData: Array<{
    month: string
    scans: number
  }>
}

