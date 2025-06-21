export class ImportService {
  async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n").filter((line) => line.trim())

          if (lines.length < 2) {
            throw new Error("File must contain at least header and one data row")
          }

          const headers = lines[0].split(",").map((h) => h.trim())
          const data = lines.slice(1).map((line, index) => {
            const values = this.parseCSVLine(line)

            if (values.length !== headers.length) {
              throw new Error(`Row ${index + 2}: Column count mismatch`)
            }

            const row: any = {}
            headers.forEach((header, i) => {
              row[header] = this.parseValue(values[i])
            })

            return row
          })

          resolve(data)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  async validateMetricData(data: any[]): Promise<{ valid: any[]; errors: string[] }> {
    const valid: any[] = []
    const errors: string[] = []

    data.forEach((row, index) => {
      const rowErrors: string[] = []

      // Проверка обязательных полей
      if (!row.date) rowErrors.push("Missing date")
      if (!row.month) rowErrors.push("Missing month")
      if (typeof row.value !== "number") rowErrors.push("Invalid value")

      // Проверка формата даты
      if (row.date && isNaN(Date.parse(row.date))) {
        rowErrors.push("Invalid date format")
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(", ")}`)
      } else {
        valid.push(row)
      }
    })

    return { valid, errors }
  }

  async validateEventData(data: any[]): Promise<{ valid: any[]; errors: string[] }> {
    const valid: any[] = []
    const errors: string[] = []

    const validCategories = ["marketing", "operations", "finance", "hr", "product"]
    const validImpacts = ["low", "medium", "high"]

    data.forEach((row, index) => {
      const rowErrors: string[] = []

      if (!row.title) rowErrors.push("Missing title")
      if (!row.date) rowErrors.push("Missing date")
      if (!row.category || !validCategories.includes(row.category)) {
        rowErrors.push("Invalid category")
      }
      if (!row.impact || !validImpacts.includes(row.impact)) {
        rowErrors.push("Invalid impact")
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(", ")}`)
      } else {
        valid.push(row)
      }
    })

    return { valid, errors }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  private parseValue(value: string): any {
    value = value.trim()

    // Удаляем кавычки если они есть
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/""/g, '"')
    }

    // Пытаемся парсить как число
    const numValue = Number(value)
    if (!isNaN(numValue) && value !== "") {
      return numValue
    }

    // Пытаемся парсить как дату
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return value
    }

    return value
  }
}
