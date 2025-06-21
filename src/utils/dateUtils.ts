export class DateUtils {
  static formatDate(date: Date): string {
    return date.toISOString().split("T")[0]
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString)
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }

  static getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date()
    let start: Date

    switch (period) {
      case "7d":
        start = this.addDays(end, -7)
        break
      case "30d":
        start = this.addDays(end, -30)
        break
      case "90d":
        start = this.addDays(end, -90)
        break
      case "1y":
        start = this.addMonths(end, -12)
        break
      default:
        start = this.addDays(end, -30)
    }

    return { start, end }
  }

  static isValidDateRange(start: string, end: string): boolean {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate
  }

  static getQuarterStart(date: Date): Date {
    const quarter = Math.floor(date.getMonth() / 3)
    return new Date(date.getFullYear(), quarter * 3, 1)
  }

  static getYearStart(date: Date): Date {
    return new Date(date.getFullYear(), 0, 1)
  }

  static getWeekStart(date: Date): Date {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
  }
}
