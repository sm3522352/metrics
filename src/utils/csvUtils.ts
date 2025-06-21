import csv from "csv-parser"
import { createObjectCsvWriter } from "csv-writer"
import * as XLSX from "xlsx"
import { Readable } from "stream"

export interface CsvParseResult<T> {
  data: T[]
  errors: string[]
}

export class CsvUtils {
  static async parseCSV<T>(buffer: Buffer): Promise<CsvParseResult<T>> {
    return new Promise((resolve) => {
      const data: T[] = []
      const errors: string[] = []
      let rowIndex = 0

      const stream = Readable.from(buffer)

      stream
        .pipe(csv())
        .on("data", (row) => {
          try {
            rowIndex++
            data.push(row as T)
          } catch (error) {
            errors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        })
        .on("end", () => {
          resolve({ data, errors })
        })
        .on("error", (error) => {
          errors.push(`Parse error: ${error.message}`)
          resolve({ data, errors })
        })
    })
  }

  static async parseExcel<T>(buffer: Buffer): Promise<CsvParseResult<T>> {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet) as T[]

      return { data, errors: [] }
    } catch (error) {
      return {
        data: [],
        errors: [`Excel parse error: ${error instanceof Error ? error.message : "Unknown error"}`],
      }
    }
  }

  static async generateCSV<T extends Record<string, any>>(
    data: T[],
    headers: Array<{ id: keyof T; title: string }>,
    filename: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const writer = createObjectCsvWriter({
        path: `/tmp/${filename}`,
        header: headers,
      })

      writer
        .writeRecords(data)
        .then(() => {
          // In a real implementation, you'd read the file and return the buffer
          // For now, we'll create a simple CSV string
          const csvContent = this.createCSVContent(data, headers)
          resolve(Buffer.from(csvContent))
        })
        .catch(reject)
    })
  }

  static generateExcel<T extends Record<string, any>>(data: T[], sheetName = "Sheet1"): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  }

  private static createCSVContent<T extends Record<string, any>>(
    data: T[],
    headers: Array<{ id: keyof T; title: string }>,
  ): string {
    const headerRow = headers.map((h) => h.title).join(",")
    const dataRows = data.map((row) => headers.map((h) => this.escapeCsvValue(row[h.id])).join(","))

    return [headerRow, ...dataRows].join("\n")
  }

  private static escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return ""

    const stringValue = String(value)

    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  static validateMetricData(row: any, rowIndex: number): string[] {
    const errors: string[] = []

    if (!row.metricName || typeof row.metricName !== "string") {
      errors.push(`Row ${rowIndex}: metricName is required and must be a string`)
    }

    if (!row.date || isNaN(Date.parse(row.date))) {
      errors.push(`Row ${rowIndex}: date is required and must be a valid date`)
    }

    if (row.value === undefined || row.value === null || isNaN(Number(row.value))) {
      errors.push(`Row ${rowIndex}: value is required and must be a number`)
    }

    return errors
  }

  static validateEventData(row: any, rowIndex: number): string[] {
    const errors: string[] = []

    if (!row.name || typeof row.name !== "string") {
      errors.push(`Row ${rowIndex}: name is required and must be a string`)
    }

    if (!row.category || typeof row.category !== "string") {
      errors.push(`Row ${rowIndex}: category is required and must be a string`)
    }

    if (!row.startDate || isNaN(Date.parse(row.startDate))) {
      errors.push(`Row ${rowIndex}: startDate is required and must be a valid date`)
    }

    if (row.endDate && isNaN(Date.parse(row.endDate))) {
      errors.push(`Row ${rowIndex}: endDate must be a valid date if provided`)
    }

    if (row.impact && !["low", "medium", "high"].includes(row.impact)) {
      errors.push(`Row ${rowIndex}: impact must be one of: low, medium, high`)
    }

    return errors
  }
}
