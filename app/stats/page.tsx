"use client"

import React, { useState, useEffect } from "react"
import { Users, ArrowUp, ArrowDown, UserRound, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
  PieChart,
  Pie,
  LabelList,
} from "recharts"
import { getStatsData } from "@/app/actions/stats"
import type { TimeFilter } from "@/types/stats"
import { getCurrentUser } from "@/lib/auth-client"

// Calcula el mejor día según asistencia semanal
const calculateBestPerformance = (
  weekdayAttendance: { day: string; count: number }[] | null
) => {
  if (!weekdayAttendance || weekdayAttendance.length === 0) return null
  const bestDay = weekdayAttendance.reduce(
    (max, current) => (current.count > max.count ? current : max),
    weekdayAttendance[0]
  )
  const today = new Date()
  const dayIndex = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].indexOf(bestDay.day)
  const date = new Date(today)
  if (dayIndex !== -1) {
    const offset = (today.getDay() - dayIndex + 7) % 7
    date.setDate(today.getDate() - offset)
  }
  return {
    day: bestDay.day,
    count: bestDay.count,
    date: date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  }
}

// Formatea rango de fechas según filtro
const formatDateRange = (filter: TimeFilter) => {
  const now = new Date()
  const start = new Date()
  if (filter === "7d") start.setDate(now.getDate() - 7)
  if (filter === "30d") start.setDate(now.getDate() - 30)

  if (filter === "24h") return "Últimas 24 horas"
  const fmt = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
  return `${fmt(start)} – ${fmt(now)}`
}

export default function StatsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d")
  const [statsData, setStatsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const user = await getCurrentUser()
        const data = await getStatsData(user?.establishment_id, timeFilter)
        setStatsData(data)
      } catch {
        setError("No se pudieron cargar las estadísticas.")
      } finally {
        setLoading(false)
      }
    })()
  }, [timeFilter])

  if (loading)
    return <div className="flex h-screen items-center justify-center">Cargando...</div>
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    )
  if (!statsData)
    return <div className="flex h-screen items-center justify-center">Sin datos disponibles</div>

  const bestPerf = calculateBestPerformance(statsData.weekdayAttendance)
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
      {children}
    </div>
  )

  const Tooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-sm">
          <div className="font-semibold text-blue-400 mb-1">{label}</div>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex justify-between text-gray-100">
              <span>{p.name}</span>
              <span>{p.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-4xl font-extrabold text-white">
            Dashboard de Estadísticas
          </h1>
          <div className="flex items-center space-x-2">
            {(["24h", "7d", "30d"] as TimeFilter[]).map((f) => (
              <Button
                key={f}
                variant="outline"
                className={`px-3 py-1 rounded-full transition-colors ${
                  timeFilter === f
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-700"
                }`}
                onClick={() => setTimeFilter(f)}
              >
                {f}
              </Button>
            ))}
            <span className="text-gray-300 ml-4">
              {formatDateRange(timeFilter)}
            </span>
          </div>
        </header>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                Asistentes por Sexo
              </h2>
              <Users className="text-blue-400" />
            </div>
            {['female', 'male'].map((k) => {
              const it = statsData.attendanceData[k]
              return (
                <div
                  key={k}
                  className="flex justify-between items-center py-2"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${{
                        female: 'bg-pink-600',
                        male: 'bg-blue-600',
                      }[k]}`}/>
                    <span className="text-gray-200 capitalize">
                      {k === 'female' ? 'Femenino' : 'Masculino'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {it.change.startsWith('-') ? (
                      <ArrowDown className="text-red-500" />
                    ) : (
                      <ArrowUp className="text-green-500" />
                    )}
                    <span className="text-gray-100 font-medium">
                      {it.count}
                    </span>
                  </div>
                </div>
              )
            })}
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Incidentes</h2>
              <AlertTriangle className="text-yellow-400" />
            </div>
            {Object.entries(statsData.incidentsData).map(
              ([label, data]: [string, any]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2"
                >
                  <span className="text-gray-300 capitalize">
                    {label}
                  </span>
                  <div className="flex items-center space-x-1">
                    {data.change.startsWith('-') ? (
                      <ArrowDown className="text-red-500" />
                    ) : (
                      <ArrowUp className="text-green-500" />
                    )}
                    <span className="text-gray-100 font-medium">
                      {data.count}
                    </span>
                  </div>
                </div>
              )
            )}
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                Nacionalidad
              </h2>
              <UserRound className="text-purple-400" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Chilena', value: statsData.nacionalidad },
                        { name: 'Extranjera', value: statsData.nacionalidad },
                      ]}
                      dataKey="value"
                      innerRadius={20}
                      outerRadius={40}
                      paddingAngle={2}
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="#EC4899" />
                    </Pie>
                    <RechartsTooltip content={<Tooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Chilena', value: statsData.nationalityData.chilean },
                  { label: 'Extranjera', value: statsData.nationalityData.foreign },
                ].map((it) => (
                  <div
                    key={it.label}
                    className="flex justify-between text-gray-200"
                  >
                    <span>{it.label}</span>
                    <span className="font-semibold">{it.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">
              Distribución de Edad
            </h2>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={statsData.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" />
                  <XAxis dataKey="name" stroke="#7DD3FC" />
                  <YAxis stroke="#7DD3FC" />
                  <Legend />
                  <RechartsTooltip content={<Tooltip />} />
                  <Bar
                    dataKey="male"
                    name="Masculino"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="female"
                    name="Femenino"
                    fill="#EC4899"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
  <h2 className="text-lg font-semibold text-white mb-2">
    Afluencia Mensual
  </h2>
  <p className="text-sm text-gray-400 mb-4">
    Tendencia de asistentes por día del mes
  </p>
  <div className="h-64">
    <ResponsiveContainer>
      <BarChart
        data={statsData.weekdayAttendance}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {/* Gradiente para las barras */}
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="day"
          stroke="#9CA3AF"
          tick={{ fontSize: 12 }}
          tickMargin={8}
        />
        <YAxis
          stroke="#9CA3AF"
          tick={{ fontSize: 12 }}
          tickMargin={8}
        />
        <RechartsTooltip
          content={<Tooltip />}
          cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
        />

        <Bar
          dataKey="count"
          fill="url(#colorCount)"
          radius={[8, 8, 0, 0]}
        >
          {/* Etiquetas encima de cada barra */}
          <LabelList
            dataKey="count"
            position="top"
            fill="#F3F4F6"
            fontSize={12}
          />
          {statsData.weekdayAttendance.map((entry: any, i: number) => {
            const max = Math.max(
              ...statsData.weekdayAttendance.map((d: any) => d.count)
            );
            return (
              <Cell
                key={i}
                fill={
                  entry.count === max
                    ? "#FBBF24"
                    : "url(#colorCount)"
                }
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</Card>

        </div>

        {/* BOTTOM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">
              Mejor Día de Asistencia
            </h2>
            {bestPerf ? (
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-white">
                  {bestPerf.day} – {bestPerf.count}
                </div>
                <div className="text-gray-300">{bestPerf.date}</div>
              </div>
            ) : (
              <div className="text-gray-300">N/A</div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">
              Engagement {timeFilter === '7d' ? 'Semanal' : 'Mensual'}
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((d) => (
                <div
                  key={d}
                  className="text-xs text-blue-300 text-center"
                >
                  {d}
                </div>
              ))}
              {Array.from({
                length: new Date().getDate(),
              }).map((_, i) => {
                const val = Math.random()
                const bg =
                  val < 0.3
                    ? 'bg-blue-600/20'
                    : val < 0.7
                    ? 'bg-blue-600/50'
                    : 'bg-blue-600'
                return (
                  <div
                    key={i}
                    className={`${bg} aspect-square rounded transition-opacity`}
                  />
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
