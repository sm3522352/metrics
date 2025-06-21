export interface Insight {
  id: string
  type: "positive" | "negative" | "warning" | "info" | "critical"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  actionItems: string[]
  metricIds: string[]
  eventIds: number[]
  confidence: number
  createdAt: Date
}

export interface PeriodComparison {
  id: string
  name: string
  period1: Period
  period2: Period
  metrics: string[]
  results: ComparisonResult[]
  createdAt: Date
}

export interface Period {
  name: string
  start: string
  end: string
}

export interface ComparisonResult {
  metricId: string
  value1: number
  value2: number
  change: number
  changePercent: number
  significance: "critical" | "significant" | "stable"
}
