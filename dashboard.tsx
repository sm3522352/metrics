"use client"

import React from "react"

import { useState, useMemo, useCallback } from "react"
import {
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Heart,
  Zap,
  Users,
  Target,
  Briefcase,
  CreditCard,
  UserPlus,
  Eye,
  MousePointer,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  Pin,
  PinOff,
  BarChart,
  Lock,
  GitCompare,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricService } from "./services/metricService"
import { EventService } from "./services/eventService"
import { AnalyticsService } from "./services/analyticsService"
import { ExportService } from "./services/exportService"
import { ImportService } from "./services/importService"

// Расширенные данные метрик по месяцам
const allMetricsData = [
  {
    month: "Сен 2023",
    date: "2023-09-15",
    registrations: 800,
    customers: 6500,
    conversion_rate: 2.8,
    total_revenue: 1800,
    ltv: 650,
    average_bill: 220,
    retention: 72,
    mau: 12000,
    dau: 3200,
  },
  {
    month: "Окт 2023",
    date: "2023-10-15",
    registrations: 950,
    customers: 7200,
    conversion_rate: 3.0,
    total_revenue: 2100,
    ltv: 720,
    average_bill: 240,
    retention: 75,
    mau: 13200,
    dau: 3600,
  },
  {
    month: "Ноя 2023",
    date: "2023-11-15",
    registrations: 1100,
    customers: 7800,
    conversion_rate: 3.1,
    total_revenue: 2300,
    ltv: 780,
    average_bill: 260,
    retention: 76,
    mau: 14000,
    dau: 3900,
  },
  {
    month: "Дек 2023",
    date: "2023-12-15",
    registrations: 1050,
    customers: 8200,
    conversion_rate: 2.9,
    total_revenue: 2200,
    ltv: 800,
    average_bill: 270,
    retention: 77,
    mau: 14500,
    dau: 4000,
  },
  {
    month: "Янв 2024",
    date: "2024-01-15",
    registrations: 1200,
    customers: 8500,
    conversion_rate: 3.2,
    total_revenue: 2400,
    ltv: 850,
    average_bill: 280,
    retention: 78,
    mau: 15000,
    dau: 4200,
  },
  {
    month: "Фев 2024",
    date: "2024-02-15",
    registrations: 1450,
    customers: 9200,
    conversion_rate: 3.8,
    total_revenue: 2800,
    ltv: 920,
    average_bill: 305,
    retention: 82,
    mau: 16500,
    dau: 4800,
  },
  {
    month: "Мар 2024",
    date: "2024-03-15",
    registrations: 1680,
    customers: 10100,
    conversion_rate: 4.2,
    total_revenue: 3200,
    ltv: 1050,
    average_bill: 315,
    retention: 85,
    mau: 18200,
    dau: 5400,
  },
  {
    month: "Апр 2024",
    date: "2024-04-15",
    registrations: 1520,
    customers: 9800,
    conversion_rate: 3.9,
    total_revenue: 2900,
    ltv: 980,
    average_bill: 295,
    retention: 80,
    mau: 17800,
    dau: 5100,
  },
  {
    month: "Май 2024",
    date: "2024-05-15",
    registrations: 1850,
    customers: 11200,
    conversion_rate: 4.8,
    total_revenue: 3500,
    ltv: 1250,
    average_bill: 340,
    retention: 88,
    mau: 20500,
    dau: 6200,
  },
  {
    month: "Июн 2024",
    date: "2024-06-15",
    registrations: 2100,
    customers: 12500,
    conversion_rate: 5.2,
    total_revenue: 3800,
    ltv: 1400,
    average_bill: 365,
    retention: 92,
    mau: 22800,
    dau: 7100,
  },
]

// Конфигурация метрик
const metricsConfig = {
  registrations: {
    label: "Регистрации",
    color: "#3b82f6",
    icon: UserPlus,
    unit: "",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return value.toLocaleString()
    },
  },
  customers: {
    label: "Кол-во клиентов",
    color: "#10b981",
    icon: Users,
    unit: "",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return value.toLocaleString()
    },
  },
  conversion_rate: {
    label: "Конверсия",
    color: "#f59e0b",
    icon: MousePointer,
    unit: "%",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return `${value}%`
    },
  },
  total_revenue: {
    label: "Выручка",
    color: "#8b5cf6",
    icon: DollarSign,
    unit: "₽K",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return `₽${value}K`
    },
  },
  ltv: {
    label: "LTV",
    color: "#ef4444",
    icon: TrendingUp,
    unit: "₽",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return `₽${value}`
    },
  },
  average_bill: {
    label: "Средний чек",
    color: "#06b6d4",
    icon: CreditCard,
    unit: "₽",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return `₽${value}`
    },
  },
  retention: {
    label: "Удержание",
    color: "#84cc16",
    icon: Heart,
    unit: "%",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return `${value}%`
    },
  },
  mau: {
    label: "MAU",
    color: "#f97316",
    icon: Eye,
    unit: "",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return value.toLocaleString()
    },
  },
  dau: {
    label: "DAU",
    color: "#ec4899",
    icon: Zap,
    unit: "",
    format: (value: number | undefined | null) => {
      if (value === undefined || value === null) return "—"
      return value.toLocaleString()
    },
  },
}

// Все события компании
const allBusinessEvents = [
  {
    id: 1,
    date: "2023-10-10",
    title: "Редизайн сайта",
    category: "operations",
    description: "Полное обновление пользовательского интерфейса",
    impact: "medium",
    expectedChange: "Рост конверсии на 0.2%",
    actualChange: "+0.1% конверсия в ноябре",
    investment: "₽400K",
    affectedMetrics: ["conversion_rate", "registrations"],
    correlation: 0.3,
  },
  {
    id: 2,
    date: "2023-12-01",
    title: "Новогодняя акция",
    category: "marketing",
    description: "Праздничные скидки и специальные предложения",
    impact: "medium",
    expectedChange: "Рост выручки на 10%",
    actualChange: "-4.3% выручка в декабре",
    investment: "₽200K",
    affectedMetrics: ["total_revenue", "average_bill"],
    correlation: -0.2,
  },
  {
    id: 3,
    date: "2024-01-20",
    title: "Запуск digital-кампании",
    category: "marketing",
    description: "Масштабная рекламная кампания в социальных сетях и поисковых системах",
    impact: "high",
    expectedChange: "Рост регистраций на 20%",
    actualChange: "+20.8% регистрации в феврале",
    investment: "₽500K",
    affectedMetrics: ["registrations", "customers"],
    correlation: 0.8,
  },
  {
    id: 4,
    date: "2024-02-05",
    title: "Внедрение CRM Salesforce",
    category: "operations",
    description: "Переход на новую систему управления клиентами для улучшения конверсии",
    impact: "medium",
    expectedChange: "Улучшение конверсии на 0.5%",
    actualChange: "+0.4% конверсия в марте",
    investment: "₽300K",
    affectedMetrics: ["conversion_rate", "ltv"],
    correlation: 0.4,
  },
  {
    id: 5,
    date: "2024-03-01",
    title: "Найм Head of Sales",
    category: "hr",
    description: "Привлечение опытного руководителя отдела продаж из конкурирующей компании",
    impact: "high",
    expectedChange: "Рост выручки на 15%",
    actualChange: "+14.3% выручка в марте",
    investment: "₽200K/мес",
    affectedMetrics: ["total_revenue", "conversion_rate"],
    correlation: 0.7,
  },
  {
    id: 6,
    date: "2024-03-25",
    title: "Оптимизация воронки",
    category: "operations",
    description: "Улучшение UX и оптимизация процесса покупки",
    impact: "medium",
    expectedChange: "Рост конверсии на 0.3%",
    actualChange: "-0.3% конверсия в апреле",
    investment: "₽150K",
    affectedMetrics: ["conversion_rate"],
    correlation: -0.1,
  },
  {
    id: 7,
    date: "2024-04-10",
    title: "Программа лояльности",
    category: "marketing",
    description: "Запуск системы бонусов и персональных предложений для клиентов",
    impact: "medium",
    expectedChange: "Рост удержания на 8%",
    actualChange: "+10% удержание в мае",
    investment: "₽150K",
    affectedMetrics: ["retention", "ltv"],
    correlation: 0.6,
  },
  {
    id: 8,
    date: "2024-05-20",
    title: "Реферальная программа",
    category: "marketing",
    description: "Запуск программы привлечения клиентов через рекомендации",
    impact: "high",
    expectedChange: "Рост регистраций на 15%",
    actualChange: "+13.5% регистрации в июне",
    investment: "₽100K",
    affectedMetrics: ["registrations", "customers"],
    correlation: 0.75,
  },
]

const categoryConfig = {
  marketing: {
    color: "#3b82f6",
    bgColor: "bg-blue-500",
    lightBg: "bg-blue-50",
    textColor: "text-blue-700",
    label: "Маркетинг",
    icon: Target,
  },
  finance: {
    color: "#10b981",
    bgColor: "bg-green-500",
    lightBg: "bg-green-50",
    textColor: "text-green-700",
    label: "Финансы",
    icon: CreditCard,
  },
  operations: {
    color: "#f59e0b",
    bgColor: "bg-orange-500",
    lightBg: "bg-orange-50",
    textColor: "text-orange-700",
    label: "Операции",
    icon: Briefcase,
  },
  hr: {
    color: "#8b5cf6",
    bgColor: "bg-purple-500",
    lightBg: "bg-purple-50",
    textColor: "text-purple-700",
    label: "HR",
    icon: Users,
  },
}

const periodOptions = [
  { value: "1m", label: "1 месяц", months: 1 },
  { value: "3m", label: "3 месяца", months: 3 },
  { value: "6m", label: "6 месяцев", months: 6 },
  { value: "1y", label: "1 год", months: 12 },
  { value: "all", label: "Все время", months: null },
  { value: "custom", label: "Выбрать период", months: null },
]

// Тултип только для метрик
const MetricTooltip = ({ active, payload, label, pinnedMetric, onPin }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl max-w-xs z-50 animate-in fade-in-0 zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{label}</h4>
        <Button size="sm" variant="ghost" onClick={() => onPin(payload[0])} className="h-6 w-6 p-0">
          {pinnedMetric ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
        </Button>
      </div>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-gray-600">{entry.name}</span>
            </div>
            <span className="font-medium text-gray-900 text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Компонент события на графике - единый элемент
const EventMarker = ({
  event,
  position,
  metricKey,
  onEventClick,
  isHighlighted,
  isPinned,
  pinnedEvent,
  onPin,
}: any) => {
  const config = categoryConfig[event.category as keyof typeof categoryConfig]
  const metricConfig = metricsConfig[metricKey as keyof typeof metricsConfig]
  const Icon = config.icon

  const leftPosition = 20 + (position.dataIndex / (position.totalPoints - 1)) * 75

  const chartHeight = 450
  const iconTopPosition = 20
  const yPosition = iconTopPosition

  // Определяем силу корреляции
  const getCorrelationColor = (correlation: number) => {
    if (Math.abs(correlation) > 0.7) return "text-green-600"
    if (Math.abs(correlation) > 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  const getCorrelationLabel = (correlation: number) => {
    if (Math.abs(correlation) > 0.7) return "Сильная связь"
    if (Math.abs(correlation) > 0.4) return "Средняя связь"
    return "Слабая связь"
  }

  return (
    <div
      className="absolute pointer-events-auto group"
      style={{
        left: `${leftPosition}%`,
        top: `${yPosition}px`,
        transform: "translateX(-50%)",
        zIndex: isPinned ? 30 : 20,
      }}
    >
      {/* Иконка события */}
      <div
        className={`w-5 h-5 rounded-full ${config.bgColor} flex items-center justify-center border-2 border-white shadow-lg cursor-pointer transition-all duration-300 ${
          isHighlighted ? "scale-125 shadow-xl ring-2 ring-blue-200" : "hover:scale-110 hover:shadow-xl"
        } relative z-10`}
        onClick={() => onEventClick(event)}
      >
        <Icon className="w-2.5 h-2.5 text-white" />
      </div>

      {/* Вертикальная полоса */}
      <div
        className={`w-0.5 transition-all duration-300 ${
          isHighlighted ? "opacity-100" : "opacity-60 group-hover:opacity-90"
        }`}
        style={{
          height: `${chartHeight - 80}px`,
          backgroundColor: config.color,
          marginLeft: "50%",
          transform: "translateX(-50%)",
          marginTop: "2px",
        }}
      />

      {/* Тултип события */}
      <div
        className={`absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl border transition-all duration-300 z-50 w-80 pointer-events-none ${
          isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${config.bgColor} flex items-center justify-center`}>
              <Icon className="w-2 h-2 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900">{event.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-xs ${config.textColor}`}>
              {config.label}
            </Badge>
            {!isPinned && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onPin(event)
                }}
                className="h-6 w-6 p-0 pointer-events-auto"
              >
                <Pin className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{event.description}</p>

        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
          <div>
            <span className="text-gray-500">Дата:</span>
            <div className="font-medium text-gray-900">{new Date(event.date).toLocaleDateString("ru-RU")}</div>
          </div>
          <div>
            <span className="text-gray-500">Инвестиции:</span>
            <div className="font-medium text-gray-900">{event.investment}</div>
          </div>
        </div>

        {/* Корреляция */}
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Корреляция с метрикой:</span>
            <span className={`font-medium ${getCorrelationColor(event.correlation)}`}>
              {getCorrelationLabel(event.correlation)} ({event.correlation > 0 ? "+" : ""}
              {event.correlation})
            </span>
          </div>
        </div>

        <div className="p-2 bg-green-50 rounded text-xs border-l-2 border-green-400">
          <div className="text-green-700 font-medium mb-1">Фактический результат:</div>
          <div className="text-green-600">{event.actualChange}</div>
        </div>

        {/* Связанные метрики */}
        <div className="mt-3 pt-2 border-t">
          <span className="text-xs text-gray-500">Связанные метрики:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {event.affectedMetrics.map((metric: string) => (
              <Badge key={metric} variant="outline" className="text-xs">
                {metricsConfig[metric as keyof typeof metricsConfig]?.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Компонент сравнения периодов
const PeriodComparison = ({ data, selectedMetrics, comparisonPeriods }: any) => {
  if (!comparisonPeriods.period1 || !comparisonPeriods.period2) return null

  const period1Data = data.filter((item: any) => {
    const date = new Date(item.date)
    return date >= new Date(comparisonPeriods.period1.start) && date <= new Date(comparisonPeriods.period1.end)
  })

  const period2Data = data.filter((item: any) => {
    const date = new Date(item.date)
    return date >= new Date(comparisonPeriods.period2.start) && date <= new Date(comparisonPeriods.period2.end)
  })

  const getAverage = (data: any[], metric: string) => {
    const values = data.map((d) => d[metric]).filter(Boolean)
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Сравнение периодов
        </CardTitle>
        <CardDescription>
          {comparisonPeriods.period1.name} vs {comparisonPeriods.period2.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Метрика</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                  {comparisonPeriods.period1.name}
                </th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                  {comparisonPeriods.period2.name}
                </th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Изменение</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">%</th>
              </tr>
            </thead>
            <tbody>
              {selectedMetrics.map((metricKey: string) => {
                const config = metricsConfig[metricKey as keyof typeof metricsConfig]
                const Icon = config.icon
                const value1 = getAverage(period1Data, metricKey)
                const value2 = getAverage(period2Data, metricKey)
                const change = value2 - value1
                const changePercent = value1 !== 0 ? ((change / value1) * 100).toFixed(1) : "0"
                const isPositive = change > 0

                return (
                  <tr key={metricKey} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: config.color }} />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-sm text-gray-600">{config.format(value1)}</td>
                    <td className="text-right py-3 px-2 text-sm font-medium">{config.format(value2)}</td>
                    <td className="text-right py-3 px-2">
                      <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? "+" : ""}
                        {config.format(change)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive ? "+" : ""}
                          {changePercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Компонент таблицы изменений за период
const PeriodChangesTable = ({ data, selectedMetrics }: any) => {
  if (!data || data.length < 2) return null

  const startData = data[0]
  const endData = data[data.length - 1]

  const changes = selectedMetrics.map((metricKey: string) => {
    const config = metricsConfig[metricKey as keyof typeof metricsConfig]
    const startValue = startData[metricKey]
    const endValue = endData[metricKey]
    const absoluteChange = endValue - startValue
    const relativeChange = ((absoluteChange / startValue) * 100).toFixed(1)

    const isCritical = Math.abs(Number.parseFloat(relativeChange)) > 20
    const isPositive = absoluteChange > 0

    return {
      key: metricKey,
      config,
      startValue,
      endValue,
      absoluteChange,
      relativeChange: Number.parseFloat(relativeChange),
      isCritical,
      isPositive,
    }
  })

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Итоговые изменения за период
        </CardTitle>
        <CardDescription>Сравнение начальных и конечных значений метрик</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Метрика</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Начальное</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Конечное</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Изменение</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">%</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Статус</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change) => {
                const Icon = change.config.icon
                return (
                  <tr key={change.key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: change.config.color }} />
                        <span className="text-sm font-medium">{change.config.label}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-sm text-gray-600">
                      {change.config.format(change.startValue)}
                    </td>
                    <td className="text-right py-3 px-2 text-sm font-medium">
                      {change.config.format(change.endValue)}
                    </td>
                    <td className="text-right py-3 px-2">
                      <span className={`text-sm font-medium ${change.isPositive ? "text-green-600" : "text-red-600"}`}>
                        {change.isPositive ? "+" : ""}
                        {change.config.format(change.absoluteChange)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        {change.isPositive ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${change.isPositive ? "text-green-600" : "text-red-600"}`}
                        >
                          {change.isPositive ? "+" : ""}
                          {change.relativeChange}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      {change.isCritical && (
                        <div className="flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="ml-1 text-xs text-orange-600">Критично</span>
                        </div>
                      )}
                      {!change.isCritical && Math.abs(change.relativeChange) > 10 && (
                        <div className="flex items-center justify-center">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="ml-1 text-xs text-blue-600">Значимо</span>
                        </div>
                      )}
                      {Math.abs(change.relativeChange) <= 10 && (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="ml-1 text-xs text-green-600">Стабильно</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Расширенный компонент инсайтов
const InsightsPanel = ({ data, events, selectedMetrics }: any) => {
  const [isOpen, setIsOpen] = useState(true)

  const insights = useMemo(() => {
    if (!data || data.length < 2) return []

    const results = []

    // Анализ трендов
    selectedMetrics.forEach((metricKey: string) => {
      const config = metricsConfig[metricKey as keyof typeof metricsConfig]
      const values = data.map((d: any) => d[metricKey]).filter(Boolean)
      const trend = values[values.length - 1] - values[0]
      const trendPercent = ((trend / values[0]) * 100).toFixed(1)

      if (Math.abs(Number.parseFloat(trendPercent)) > 20) {
        results.push({
          type: Number.parseFloat(trendPercent) > 0 ? "positive" : "critical",
          title: `${config.label}: ${Number.parseFloat(trendPercent) > 0 ? "Сильный рост" : "Критическое снижение"}`,
          description: `Изменение на ${trendPercent}% за период. ${Number.parseFloat(trendPercent) > 0 ? "Рекомендуется масштабировать успешные инициативы и изучить факторы роста." : "Требует немедленного внимания и корректирующих мер. Проанализируйте события этого периода."}`,
          icon: Number.parseFloat(trendPercent) > 0 ? CheckCircle : AlertTriangle,
          priority: "high",
          actionItems:
            Number.parseFloat(trendPercent) > 0
              ? ["Изучить факторы успеха", "Масштабировать инициативы", "Зафиксировать процессы"]
              : ["Провести анализ причин", "Разработать план восстановления", "Усилить мониторинг"],
        })
      } else if (Math.abs(Number.parseFloat(trendPercent)) > 10) {
        results.push({
          type: Number.parseFloat(trendPercent) > 0 ? "positive" : "warning",
          title: `${config.label}: ${Number.parseFloat(trendPercent) > 0 ? "Умеренный рост" : "Снижение показателя"}`,
          description: `Изменение на ${trendPercent}% за период. ${Number.parseFloat(trendPercent) > 0 ? "Положительная динамика, стоит продолжить текущие инициативы." : "Негативная тенденция, рекомендуется принять меры."}`,
          icon: Number.parseFloat(trendPercent) > 0 ? TrendingUp : TrendingDown,
          priority: "medium",
          actionItems:
            Number.parseFloat(trendPercent) > 0
              ? ["Поддержать текущие инициативы", "Оптимизировать процессы"]
              : ["Выявить причины снижения", "Скорректировать стратегию"],
        })
      }
    })

    // Анализ событий
    const highImpactEvents = events.filter((e: any) => e.impact === "high")
    const highCorrelationEvents = events.filter((e: any) => Math.abs(e.correlation) > 0.7)

    if (highImpactEvents.length > 0) {
      results.push({
        type: "info",
        title: `Высокоэффективные инициативы: ${highImpactEvents.length}`,
        description:
          "Выявлены события с высоким влиянием на метрики. Рекомендуется повторить успешные практики и изучить неудачные для предотвращения ошибок.",
        icon: Target,
        priority: "medium",
        actionItems: [
          "Проанализировать успешные события",
          "Создать шаблоны инициатив",
          "Избегать неэффективных подходов",
        ],
      })
    }

    if (highCorrelationEvents.length > 0) {
      results.push({
        type: "positive",
        title: `События с сильной корреляцией: ${highCorrelationEvents.length}`,
        description:
          "Найдены события с высокой корреляцией с метриками. Эти типы инициатив показывают предсказуемый результат.",
        icon: BarChart,
        priority: "high",
        actionItems: ["Приоритизировать подобные инициативы", "Увеличить инвестиции в эффективные каналы"],
      })
    }

    // Анализ волатильности
    selectedMetrics.forEach((metricKey: string) => {
      const config = metricsConfig[metricKey as keyof typeof metricsConfig]
      const values = data.map((d: any) => d[metricKey]).filter(Boolean)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
      const volatility = (Math.sqrt(variance) / mean) * 100

      if (volatility > 30) {
        results.push({
          type: "warning",
          title: `${config.label}: Высокая волатильность`,
          description: `Показатель сильно колеблется (${volatility.toFixed(1)}% от среднего). Это может указывать на нестабильность процессов или внешние факторы.`,
          icon: AlertTriangle,
          priority: "medium",
          actionItems: ["Стабилизировать процессы", "Выявить источники колебаний", "Улучшить прогнозирование"],
        })
      }
    })

    return results
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return (
          priorityOrder[b.priority as keyof typeof priorityOrder] -
          priorityOrder[a.priority as keyof typeof priorityOrder]
        )
      })
      .slice(0, 8)
  }, [data, events, selectedMetrics])

  return (
    <Card className="mt-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Инсайты и рекомендации
                  <Badge variant="secondary">{insights.length}</Badge>
                </CardTitle>
                <CardDescription>Автоматический анализ трендов и рекомендации по улучшению показателей</CardDescription>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === "positive"
                        ? "bg-green-50 border-green-400"
                        : insight.type === "critical"
                          ? "bg-red-50 border-red-400"
                          : insight.type === "warning"
                            ? "bg-orange-50 border-orange-400"
                            : "bg-blue-50 border-blue-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-5 w-5 mt-0.5 ${
                          insight.type === "positive"
                            ? "text-green-600"
                            : insight.type === "critical"
                              ? "text-red-600"
                              : insight.type === "warning"
                                ? "text-orange-600"
                                : "text-blue-600"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={`font-medium text-sm ${
                              insight.type === "positive"
                                ? "text-green-800"
                                : insight.type === "critical"
                                  ? "text-red-800"
                                  : insight.type === "warning"
                                    ? "text-orange-800"
                                    : "text-blue-800"
                            }`}
                          >
                            {insight.title}
                          </h4>
                          <Badge
                            variant={
                              insight.priority === "high"
                                ? "destructive"
                                : insight.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {insight.priority === "high"
                              ? "Высокий"
                              : insight.priority === "medium"
                                ? "Средний"
                                : "Низкий"}
                          </Badge>
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed mb-3 ${
                            insight.type === "positive"
                              ? "text-green-700"
                              : insight.type === "critical"
                                ? "text-red-700"
                                : insight.type === "warning"
                                  ? "text-orange-700"
                                  : "text-blue-700"
                          }`}
                        >
                          {insight.description}
                        </p>
                        {insight.actionItems && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-600">Рекомендуемые действия:</span>
                            <ul className="mt-1 space-y-1">
                              {insight.actionItems.map((action: string, actionIndex: number) => (
                                <li key={actionIndex} className="text-xs text-gray-600 flex items-center gap-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {insights.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Недостаточно данных для анализа</p>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default function CorrelationDashboard() {
  // Initialize services
  const metricService = useMemo(() => new MetricService(), [])
  const eventService = useMemo(() => new EventService(), [])
  const analyticsService = useMemo(() => new AnalyticsService(), [])
  const exportService = useMemo(() => new ExportService(), [])
  const importService = useMemo(() => new ImportService(), [])

  // State management
  const [selectedMetrics, setSelectedMetrics] = useState(["total_revenue", "registrations", "conversion_rate"])
  const [selectedPeriod, setSelectedPeriod] = useState("6m")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null)
  const [pinnedEvent, setPinnedEvent] = useState<any>(null)
  const [pinnedMetric, setPinnedMetric] = useState<any>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(categoryConfig))
  const [showFilters, setShowFilters] = useState(false)
  const [importedData, setImportedData] = useState<any[]>([])
  const [lockedPeriods, setLockedPeriods] = useState<any[]>([])
  const [comparisonMode, setComparisonMode] = useState(false)
  const [comparisonPeriods, setComparisonPeriods] = useState<any>({})
  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
    impact: "medium",
    expectedChange: "",
    investment: "",
  })
  const [filteredData, setFilteredData] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [insights, setInsights] = useState([])

  // Объединяем импортированные и базовые данные
  const combinedMetricsData = useMemo(() => {
    if (importedData.length > 0) {
      return [...allMetricsData, ...importedData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
    }
    return allMetricsData
  }, [importedData])

  // Фильтрация данных по выбранному периоду
  const { filteredData: calculatedFilteredData, filteredEvents: calculatedFilteredEvents } = useMemo(() => {
    const selectedPeriodConfig = periodOptions.find((p) => p.value === selectedPeriod)

    const dataToFilter = combinedMetricsData
    const eventsToFilter = allBusinessEvents.filter((event) => selectedCategories.includes(event.category))

    if (selectedPeriod === "custom" && customDateFrom && customDateTo) {
      const fromDate = new Date(customDateFrom)
      const toDate = new Date(customDateTo)

      const filteredData = dataToFilter.filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= fromDate && itemDate <= toDate
      })

      const filteredEvents = eventsToFilter.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= fromDate && eventDate <= toDate
      })

      return { filteredData, filteredEvents }
    }

    if (!selectedPeriodConfig || selectedPeriodConfig.months === null) {
      return {
        filteredData: dataToFilter,
        filteredEvents: eventsToFilter,
      }
    }

    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - selectedPeriodConfig.months)

    const filteredData = dataToFilter.filter((item) => new Date(item.date) >= cutoffDate)
    const filteredEvents = eventsToFilter.filter((event) => new Date(event.date) >= cutoffDate)

    return { filteredData, filteredEvents }
  }, [selectedPeriod, customDateFrom, customDateTo, selectedCategories, combinedMetricsData])

  // Load data using services
  const loadMetricData = useCallback(async () => {
    try {
      //const data = await metricService.getMetricData(selectedMetrics, "2023-01-01", "2024-12-31")
      //setFilteredData(data)
      setFilteredData(calculatedFilteredData)
    } catch (error) {
      console.error("Failed to load metric data:", error)
    }
  }, [metricService, selectedMetrics, calculatedFilteredData])

  const loadEvents = useCallback(async () => {
    try {
      //const events = await eventService.getAllEvents()
      //setFilteredEvents(events)
      setFilteredEvents(calculatedFilteredEvents)
    } catch (error) {
      console.error("Failed to load events:", error)
    }
  }, [eventService, calculatedFilteredEvents])

  const generateInsights = useCallback(async () => {
    try {
      const generatedInsights = await analyticsService.generateInsights(filteredData, filteredEvents, selectedMetrics)
      setInsights(generatedInsights)
    } catch (error) {
      console.error("Failed to generate insights:", error)
    }
  }, [analyticsService, filteredData, filteredEvents, selectedMetrics])

  // Export functionality
  const handleExport = useCallback(async () => {
    try {
      const {
        metrics,
        events,
        insights: insightsBlob,
      } = await exportService.exportDashboardReport(filteredData, filteredEvents, insights, selectedPeriod)

      // Download files
      const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }

      downloadBlob(metrics, `metrics-${selectedPeriod}.csv`)
      downloadBlob(events, `events-${selectedPeriod}.csv`)
      downloadBlob(insightsBlob, `insights-${selectedPeriod}.csv`)
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }, [exportService, filteredData, filteredEvents, insights, selectedPeriod])

  // Import functionality
  const handleImport = useCallback(
    async (file: File) => {
      try {
        const data = await importService.parseCSV(file)
        const { valid, errors } = await importService.validateMetricData(data)

        if (errors.length > 0) {
          console.warn("Import errors:", errors)
          // Show errors to user
          alert(`Import completed with ${errors.length} errors. Check console for details.`)
        }

        if (valid.length > 0) {
          const result = await metricService.importMetricData(valid)
          console.log(`Successfully imported ${result.success} records`)
          // Reload data after import
          await loadMetricData()
        }
      } catch (error) {
        console.error("Failed to import data:", error)
        alert("Failed to import data. Please check the file format.")
      }
    },
    [importService, metricService, loadMetricData],
  )

  // Load initial data
  React.useEffect(() => {
    loadMetricData()
    loadEvents()
  }, [loadMetricData, loadEvents])

  // Generate insights when data changes
  React.useEffect(() => {
    if (filteredData.length > 0 && filteredEvents.length > 0) {
      generateInsights()
    }
  }, [filteredData, filteredEvents, generateInsights])

  const handleMetricToggle = (metricKey: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricKey) ? prev.filter((m) => m !== metricKey) : [...prev, metricKey],
    )
  }

  const handleCategoryToggle = (categoryKey: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryKey) ? prev.filter((c) => c !== categoryKey) : [...prev, categoryKey],
    )
  }

  const handleEventClick = useCallback(
    (event: any) => {
      if (pinnedEvent?.id === event.id) {
        setPinnedEvent(null)
      } else {
        setPinnedEvent(event)
      }
    },
    [pinnedEvent],
  )

  const handleEventPin = useCallback((event: any) => {
    setPinnedEvent(event)
  }, [])

  const handleMetricPin = useCallback(
    (metric: any) => {
      setPinnedMetric(pinnedMetric ? null : metric)
    },
    [pinnedMetric],
  )

  const handleAddEvent = () => {
    console.log("Adding event:", newEvent)
    setNewEvent({
      title: "",
      category: "",
      description: "",
      date: "",
      impact: "medium",
      expectedChange: "",
      investment: "",
    })
  }

  // Функция фиксации периода
  const handleLockPeriod = () => {
    const periodData = {
      id: Date.now(),
      name:
        selectedPeriod === "custom" && customDateFrom && customDateTo
          ? `${new Date(customDateFrom).toLocaleDateString("ru-RU")} - ${new Date(customDateTo).toLocaleDateString("ru-RU")}`
          : periodOptions.find((p) => p.value === selectedPeriod)?.label || "Период",
      start: selectedPeriod === "custom" ? customDateFrom : filteredData[0]?.date,
      end: selectedPeriod === "custom" ? customDateTo : filteredData[filteredData.length - 1]?.date,
      data: filteredData,
      metrics: [...selectedMetrics],
    }
    setLockedPeriods((prev) => [...prev, periodData])
  }

  // Функция сравнения периодов
  const handleComparePeriods = (period1: any, period2: any) => {
    setComparisonPeriods({ period1, period2 })
    setComparisonMode(true)
  }

  // Расширенная функция экспорта данных
  const handleExportData = () => {
    const exportData = {
      metrics: filteredData.map((item) => {
        const row: any = { date: item.date, month: item.month }
        selectedMetrics.forEach((metric) => {
          row[metric] = item[metric as keyof typeof item]
        })
        return row
      }),
      events: filteredEvents.map((event) => ({
        date: event.date,
        title: event.title,
        category: event.category,
        description: event.description,
        impact: event.impact,
        investment: event.investment,
        actualChange: event.actualChange,
        correlation: event.correlation,
      })),
      insights: [], // Здесь можно добавить экспорт инсайтов
    }

    // Создаем CSV для метрик
    const metricsCSV = [
      Object.keys(exportData.metrics[0]).join(","),
      ...exportData.metrics.map((row) => Object.values(row).join(",")),
    ].join("\n")

    // Создаем CSV для событий
    const eventsCSV = [
      Object.keys(exportData.events[0] || {}).join(","),
      ...exportData.events.map((row) => Object.values(row).join(",")),
    ].join("\n")

    // Создаем zip-файл или отдельные файлы
    const blob1 = new Blob([metricsCSV], { type: "text/csv" })
    const blob2 = new Blob([eventsCSV], { type: "text/csv" })

    const url1 = URL.createObjectURL(blob1)
    const url2 = URL.createObjectURL(blob2)

    const a1 = document.createElement("a")
    a1.href = url1
    a1.download = `metrics-export-${new Date().toISOString().split("T")[0]}.csv`
    a1.click()

    const a2 = document.createElement("a")
    a2.href = url2
    a2.download = `events-export-${new Date().toISOString().split("T")[0]}.csv`
    a2.click()

    URL.revokeObjectURL(url1)
    URL.revokeObjectURL(url2)
  }

  // Улучшенная функция импорта данных
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      const data = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",")
          const row: any = {}
          headers.forEach((header, index) => {
            const value = values[index]?.trim()
            if (header === "date") {
              row[header] = value
            } else if (header === "month") {
              row[header] = value
            } else {
              row[header] = Number.parseFloat(value) || 0
            }
          })
          return row
        })
        .filter((row) => row.date && row.month)

      setImportedData(data)
    }
    reader.readAsText(file)
  }

  // Функция для получения позиции события на графике
  const getEventPosition = (event: any, metricKey: string) => {
    const eventDate = new Date(event.date)

    // Находим ближайшую точку данных
    let closestDataPoint = filteredData[0]
    let minDiff = Math.abs(eventDate.getTime() - new Date(filteredData[0]?.date).getTime())

    filteredData.forEach((dataPoint) => {
      const diff = Math.abs(eventDate.getTime() - new Date(dataPoint.date).getTime())
      if (diff < minDiff) {
        minDiff = diff
        closestDataPoint = dataPoint
      }
    })

    // Получаем значение метрики для позиционирования по Y
    const metricValue = closestDataPoint[metricKey as keyof typeof closestDataPoint] as number

    // Нормализуем значение метрики для позиционирования по Y
    const allValues = filteredData.map((d) => d[metricKey as keyof typeof d] as number).filter(Boolean)
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const normalizedValue = (metricValue - minValue) / (maxValue - minValue)

    return {
      dataPoint: closestDataPoint,
      metricValue,
      dataIndex: filteredData.indexOf(closestDataPoint),
      normalizedValue,
      totalPoints: filteredData.length,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            Корреляция событий и метрик
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Визуальная связь между бизнес-действиями и динамикой ключевых показателей
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Import Data */}
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImportData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-file"
            />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="import-file" className="cursor-pointer flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden md:inline">Импорт</span>
              </label>
            </Button>
          </div>

          {/* Export Data */}
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Экспорт</span>
          </Button>

          {/* Lock Period */}
          <Button variant="outline" size="sm" onClick={handleLockPeriod}>
            <Lock className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Зафиксировать</span>
          </Button>

          {/* Filters */}
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Фильтры</span>
          </Button>

          {/* Period Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">
                  {selectedPeriod === "custom" && customDateFrom && customDateTo
                    ? `${new Date(customDateFrom).toLocaleDateString("ru-RU")} - ${new Date(customDateTo).toLocaleDateString("ru-RU")}`
                    : periodOptions.find((p) => p.value === selectedPeriod)?.label}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              {periodOptions.map((period) => (
                <DropdownMenuItem key={period.value} onClick={() => setSelectedPeriod(period.value)}>
                  {period.label}
                </DropdownMenuItem>
              ))}
              {selectedPeriod === "custom" && (
                <div className="p-3 border-t">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Выберите период</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">От</Label>
                        <Input
                          type="date"
                          value={customDateFrom}
                          onChange={(e) => setCustomDateFrom(e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">До</Label>
                        <Input
                          type="date"
                          value={customDateTo}
                          onChange={(e) => setCustomDateTo(e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Событие</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Новое бизнес-событие</DialogTitle>
                <DialogDescription>Добавьте событие для отслеживания его влияния на метрики</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Название события</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Например: Запуск новой рекламной кампании"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Дата события</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Подробное описание события и его целей"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expectedChange">Ожидаемое влияние</Label>
                  <Input
                    id="expectedChange"
                    value={newEvent.expectedChange}
                    onChange={(e) => setNewEvent({ ...newEvent, expectedChange: e.target.value })}
                    placeholder="Например: Рост выручки на 15%"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="investment">Инвестиции</Label>
                  <Input
                    id="investment"
                    value={newEvent.investment}
                    onChange={(e) => setNewEvent({ ...newEvent, investment: e.target.value })}
                    placeholder="Например: ₽500K"
                  />
                </div>
              </div>
              <Button onClick={handleAddEvent} className="w-full">
                Добавить событие
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pinned Elements */}
      {(pinnedEvent || pinnedMetric) && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Закрепленные элементы
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPinnedEvent(null)
                  setPinnedMetric(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {pinnedEvent && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Событие: {pinnedEvent.title}
                  <Button size="sm" variant="ghost" onClick={() => setPinnedEvent(null)} className="h-4 w-4 p-0 ml-1">
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {pinnedMetric && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <BarChart className="h-3 w-3" />
                  Метрика: {pinnedMetric.name}
                  <Button size="sm" variant="ghost" onClick={() => setPinnedMetric(null)} className="h-4 w-4 p-0 ml-1">
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Periods */}
      {lockedPeriods.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Зафиксированные периоды
              <Badge variant="secondary">{lockedPeriods.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lockedPeriods.map((period) => (
                <div key={period.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{period.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleComparePeriods(period, {
                        name: "Текущий период",
                        start: filteredData[0]?.date,
                        end: filteredData[filteredData.length - 1]?.date,
                      })
                    }
                  >
                    <GitCompare className="h-3 w-3 mr-1" />
                    Сравнить
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLockedPeriods((prev) => prev.filter((p) => p.id !== period.id))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6 animate-in slide-in-from-top-2 duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Расширенные фильтры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metrics">Метрики</TabsTrigger>
                <TabsTrigger value="events">События</TabsTrigger>
                <TabsTrigger value="advanced">Дополнительно</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Метрики (до 4)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(metricsConfig).map(([key, config]) => {
                      const Icon = config.icon
                      const isSelected = selectedMetrics.includes(key)
                      const isDisabled = !isSelected && selectedMetrics.length >= 4

                      return (
                        <div
                          key={key}
                          className={`flex items-center space-x-3 p-2 rounded-lg border transition-colors ${
                            isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                          } ${isDisabled ? "opacity-50" : ""}`}
                        >
                          <Checkbox
                            id={key}
                            checked={isSelected}
                            onCheckedChange={() => handleMetricToggle(key)}
                            disabled={isDisabled}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <Icon className="h-4 w-4" style={{ color: config.color }} />
                            <label htmlFor={key} className="text-sm font-medium cursor-pointer">
                              {config.label}
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Категории событий</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(categoryConfig).map(([key, config]) => {
                      const Icon = config.icon
                      const isSelected = selectedCategories.includes(key)

                      return (
                        <div
                          key={key}
                          className={`flex items-center space-x-3 p-2 rounded-lg border transition-colors ${
                            isSelected ? `${config.lightBg} border-gray-300` : "bg-white border-gray-200"
                          }`}
                        >
                          <Checkbox
                            id={`cat-${key}`}
                            checked={isSelected}
                            onCheckedChange={() => handleCategoryToggle(key)}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <Icon className="h-4 w-4" style={{ color: config.color }} />
                            <label htmlFor={`cat-${key}`} className="text-sm font-medium cursor-pointer">
                              {config.label}
                            </label>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {filteredEvents.filter((e) => e.category === key).length}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Уровень влияния событий</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все уровни</SelectItem>
                        <SelectItem value="high">Высокое влияние</SelectItem>
                        <SelectItem value="medium">Среднее влияние</SelectItem>
                        <SelectItem value="low">Низкое влияние</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Корреляция</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Любая корреляция</SelectItem>
                        <SelectItem value="strong">{"Сильная (>0.7)"}</SelectItem>
                        <SelectItem value="medium">{"Средняя (0.4-0.7)"}</SelectItem>
                        <SelectItem value="weak">{"Слабая (<0.4)"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Динамика метрик и события
                <Badge variant="secondary" className="ml-2">
                  {selectedPeriod === "custom" && customDateFrom && customDateTo
                    ? "Кастомный период"
                    : periodOptions.find((p) => p.value === selectedPeriod)?.label}
                </Badge>
              </CardTitle>
              <CardDescription>
                События отображаются вертикальными полосами. Наведите для подробностей или закрепите элементы.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[450px] md:h-[500px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData} margin={{ top: 50, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                    <Tooltip content={<MetricTooltip pinnedMetric={pinnedMetric} onPin={handleMetricPin} />} />

                    {/* Линии выбранных метрик */}
                    {selectedMetrics.map((metricKey) => {
                      const config = metricsConfig[metricKey as keyof typeof metricsConfig]
                      return (
                        <Line
                          key={metricKey}
                          type="monotone"
                          dataKey={metricKey}
                          stroke={config.color}
                          strokeWidth={2}
                          name={config.label}
                          dot={{
                            fill: config.color,
                            strokeWidth: 2,
                            r: 3,
                            stroke: "white",
                          }}
                          activeDot={{
                            r: 5,
                            stroke: config.color,
                            strokeWidth: 2,
                            fill: "white",
                          }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>

                {/* События на графике */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                  {filteredEvents.map((event) => {
                    return event.affectedMetrics
                      .filter((metricKey: string) => selectedMetrics.includes(metricKey))
                      .map((metricKey: string) => {
                        const position = getEventPosition(event, metricKey)
                        if (!position) return null

                        return (
                          <EventMarker
                            key={`${event.id}-${metricKey}`}
                            event={event}
                            position={position}
                            metricKey={metricKey}
                            onEventClick={handleEventClick}
                            isHighlighted={hoveredEvent === event.id}
                            isPinned={pinnedEvent?.id === event.id}
                            pinnedEvent={pinnedEvent}
                            onPin={handleEventPin}
                          />
                        )
                      })
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Period Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Статистика периода</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">События:</span>
                  <span className="font-semibold">{filteredEvents.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Высокое влияние:</span>
                  <span className="font-semibold text-green-600">
                    {filteredEvents.filter((e) => e.impact === "high").length}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Сильная корреляция:</span>
                  <span className="font-semibold text-blue-600">
                    {filteredEvents.filter((e) => Math.abs(e.correlation) > 0.7).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Точек данных:</span>
                  <span className="font-semibold text-purple-600">{filteredData.length}</span>
                </div>
                {importedData.length > 0 && (
                  <div className="flex justify-between mt-2 pt-2 border-t">
                    <span className="text-gray-600">Импортировано:</span>
                    <span className="font-semibold text-orange-600">{importedData.length}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Отслеживаемые метрики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedMetrics.map((metricKey) => {
                const config = metricsConfig[metricKey as keyof typeof metricsConfig]
                const Icon = config.icon
                const latestData = filteredData[filteredData.length - 1]
                const previousData = filteredData[filteredData.length - 2]

                const latestValue = latestData?.[metricKey]
                const previousValue = previousData?.[metricKey]

                const change =
                  latestValue && previousValue && typeof latestValue === "number" && typeof previousValue === "number"
                    ? (((latestValue - previousValue) / previousValue) * 100).toFixed(1)
                    : null

                return (
                  <div key={metricKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: config.color }} />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: config.color }}>
                        {config.format(latestValue)}
                      </div>
                      {change && (
                        <div
                          className={`text-xs ${Number.parseFloat(change) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {Number.parseFloat(change) >= 0 ? "+" : ""}
                          {change}%
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Category Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Категории событий</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon
                const eventsCount = filteredEvents.filter((e) => e.category === key).length
                const isSelected = selectedCategories.includes(key)
                const avgCorrelation =
                  filteredEvents
                    .filter((e) => e.category === key)
                    .reduce((sum, e) => sum + Math.abs(e.correlation), 0) / eventsCount || 0

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? config.lightBg : "opacity-50"
                    }`}
                    onClick={() => handleCategoryToggle(key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${config.bgColor}`} />
                      <Icon className="h-4 w-4 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium">{config.label}</span>
                        {eventsCount > 0 && (
                          <div className="text-xs text-gray-500">Корр: {avgCorrelation.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">{eventsCount}</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Period Comparison */}
      {comparisonMode && (
        <PeriodComparison
          data={combinedMetricsData}
          selectedMetrics={selectedMetrics}
          comparisonPeriods={comparisonPeriods}
        />
      )}

      {/* Period Changes Table */}
      <PeriodChangesTable data={filteredData} selectedMetrics={selectedMetrics} />

      {/* Enhanced Insights Panel */}
      <InsightsPanel data={filteredData} events={filteredEvents} selectedMetrics={selectedMetrics} />
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Executive Dashboard</h1>
        <p className="text-gray-600 mb-4">Модульная архитектура успешно реализована!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Метрики</h3>
            <p className="text-sm text-gray-600">{selectedMetrics.length} выбранных метрик</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">События</h3>
            <p className="text-sm text-gray-600">{filteredEvents.length} событий в периоде</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Инсайты</h3>
            <p className="text-sm text-gray-600">{insights.length} автоматических инсайтов</p>
          </div>
        </div>
        <div className="mt-6 space-x-4">
          <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Экспорт данных
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
            Импорт данных
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
