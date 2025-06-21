export interface Metric {
  id: string
  name: string
  label: string
  color: string
  icon: string
  unit: string
  category: "revenue" | "users" | "conversion" | "retention" | "engagement"
  format: (value: number | undefined | null) => string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MetricData {
  id: string
  metricId: string
  date: string
  month: string
  value: number
  createdAt: Date
}

export interface MetricConfig {
  [key: string]: {
    label: string
    color: string
    icon: any
    unit: string
    format: (value: number | undefined | null) => string
  }
}
