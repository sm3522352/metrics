export interface BusinessEvent {
  id: number
  title: string
  description: string
  date: string
  category: "marketing" | "operations" | "finance" | "hr" | "product"
  impact: "low" | "medium" | "high"
  expectedChange: string
  actualChange: string
  investment: string
  affectedMetrics: string[]
  correlation: number
  status: "planned" | "active" | "completed" | "cancelled"
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface EventCategory {
  id: string
  name: string
  color: string
  bgColor: string
  lightBg: string
  textColor: string
  label: string
  icon: any
}
