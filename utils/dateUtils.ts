export class DateUtils {
  static formatDate(date: Date): string {
    return date.toISOString().split("T")[0]
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString)
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }

  static subtractMonths(date: Date, months: number): Date {
    return this.addMonths(date, -months)
  }

  static getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date()
    let start: Date

    switch (period) {
      case "1m":
        start = this.subtractMonths(end, 1)
        break
      case "3m":
        start = this.subtractMonths(end, 3)
        break
      case "6m":
        start = this.subtractMonths(end, 6)
        break
      case "1y":
        start = this.subtractMonths(end, 12)
        break
      default:
        start = this.subtractMonths(end, 6)
    }

    return { start, end }
  }

  static isValidDateRange(start: string, end: string): boolean {
    const startDate = new Date(start)
    const endDate = new Date(end)

    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate
  }

  static formatDateForDisplay(date: Date, locale = "ru-RU"): string {
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
}
