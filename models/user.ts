export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "analyst" | "viewer"
  permissions: Permission[]
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: "create" | "read" | "update" | "delete"
}

export interface UserPreferences {
  defaultMetrics: string[]
  defaultPeriod: string
  theme: "light" | "dark"
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  criticalChanges: boolean
  weeklyReports: boolean
}
