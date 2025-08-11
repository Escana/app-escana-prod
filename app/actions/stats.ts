"use server"

import { supabase } from "@/lib/supabase"
import type { StatsData, TimeFilter } from "@/types/stats"

export async function getStatsData(
  id?: string,
  filter: TimeFilter
): Promise<StatsData> {
  try {
    const now = new Date()
    let startDate: Date

    // Determinar fecha de inicio según filtro
    switch (filter) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "12m":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    const startISO = startDate.toISOString()
    const endISO = now.toISOString()

    // Obtener visitas del establecimiento uniendo con clients
    const { data: visits, error: visitsError } = await supabase
      .from("visits")
      .select("client_id, entry_time, clients!inner(sexo, establishment_id)")
      .gte("entry_time", startISO)
      .lte("entry_time", endISO)
      .eq("clients.establishment_id", id)

    if (visitsError) throw new Error(visitsError.message)

    // Stats de género
    const genderStats = visits.reduce(
      (acc, v) => {
        const g = v.clients.sexo
        if (g === "F") acc.female++
        if (g === "M") acc.male++
        return acc
      },
      { female: 0, male: 0 }
    )

    // Incidentes del periodo
    const { data: incidents, error: incidentsError } = await supabase
      .from("incidents")
      .select("id")
      .eq("establishment_id", id)
      .gte("created_at", startISO)
      .lte("created_at", endISO)

    if (incidentsError) throw new Error(incidentsError.message)

    // Clientes baneados en periodo
    const { data: bans, error: bansError } = await supabase
      .from("clients")
      .select("id")
      .eq("establishment_id", id)
      .eq("is_banned", true)
      .gte("ban_start_date", startISO)
      .lte("ban_start_date", endISO)

    if (bansError) throw new Error(bansError.message)

    // Stats de nacionalidad según visitas
    const clientIds = visits.map((v) => v.client_id)
    const { data: nationalityData, error: nationalityError } = await supabase
      .from("clients")
      .select("nacionalidad")
      .in("id", clientIds)

    if (nationalityError) throw new Error(nationalityError.message)

    const nationalityStats = nationalityData.reduce(
      (acc, c) => {
        const nac = c.nacionalidad?.trim().toLowerCase()
        if (nac === "chilena") {
          acc.chilean++
        } else {
          acc.foreign++
        }
        return acc
      },
      { chilean: 0, foreign: 0 }
    )

    // Distribución de edad
    const { data: ageData, error: ageError } = await supabase
      .from("clients")
      .select("edad, sexo")
      .in("id", clientIds)

    if (ageError) throw new Error(ageError.message)

    const ageDistribution = ageData.reduce(
      (acc, c) => {
        const age = c.edad
        const g = c.sexo
        let group = "56+"
        if (age <= 25) group = "18-25"
        else if (age <= 35) group = "26-35"
        else if (age <= 45) group = "36-45"
        else if (age <= 55) group = "46-55"
        const idx = acc.findIndex((x) => x.name === group)
        if (idx >= 0) {
          if (g === "M") acc[idx].male++
          if (g === "F") acc[idx].female++
        }
        return acc
      },
      [
        { name: "18-25", male: 0, female: 0 },
        { name: "26-35", male: 0, female: 0 },
        { name: "36-45", male: 0, female: 0 },
        { name: "46-55", male: 0, female: 0 },
        { name: "56+", male: 0, female: 0 },
      ]
    )

    // Asistencia por día de la semana
    const weekdayAttendance = visits.reduce(
      (acc, v) => {
        const d = new Date(v.entry_time)
        const idx = d.getDay() === 0 ? 6 : d.getDay() - 1 // Lunes=0...
        acc[idx].count++
        return acc
      },
      [
        { day: "LUN", count: 0 },
        { day: "MAR", count: 0 },
        { day: "MIÉ", count: 0 },
        { day: "JUE", count: 0 },
        { day: "VIE", count: 0 },
        { day: "SÁB", count: 0 },
        { day: "DOM", count: 0 },
      ]
    )

    // Escaneos totales en el periodo
    const monthlyScans = visits.length

    // Retornar datos
    return {
      attendanceData: {
        female: { count: genderStats.female, change: "+0%" },
        male: { count: genderStats.male, change: "+0%" },
      },
      incidentsData: {
        total: { count: incidents.length, change: "+0%" },
        bans: { count: bans.length, change: "+0%" },
      },
      nationalityData: nationalityStats,
      ageDistribution,
      weekdayAttendance,
      monthlyScans,
    }
  } catch (err) {
    console.error("getStatsData error:", err)
    throw new Error("Error fetching statistics")
  }
}
