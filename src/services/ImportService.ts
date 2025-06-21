import { CsvUtils } from "../utils/csvUtils"
import { MetricService } from "./MetricService"
import { EventService } from "./EventService"

export interface ImportResult {
  success: number
  errors: string[]
  warnings: string[]
}

export class ImportService {
  private metricService = new MetricService()
  private eventService = new EventService()

  async importMetrics(
    buffer: Buffer,
    fileType: "csv" | "excel",
    createdBy: string,
    tenantId?: string,
  ): Promise<ImportResult> {
    try {
      const parseResult = fileType === "csv" ? await CsvUtils.parseCSV(buffer) : await CsvUtils.parseExcel(buffer)

      if (parseResult.errors.length > 0) {
        return {
          success: 0,
          errors: parseResult.errors,
          warnings: [],
        }
      }

      const validationResults = this.validateMetricData(parseResult.data)

      if (validationResults.errors.length > 0) {
        return {
          success: 0,
          errors: validationResults.errors,
          warnings: validationResults.warnings,
        }
      }

      const importResult = await this.metricService.bulkImportMetricValues(
        validationResults.validData,
        createdBy,
        tenantId,
      )

      return {
        success: importResult.success,
        errors: importResult.errors,
        warnings: validationResults.warnings,
      }
    } catch (error) {
      return {
        success: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings: [],
      }
    }
  }

  async importEvents(
    buffer: Buffer,
    fileType: "csv" | "excel",
    createdBy: string,
    tenantId?: string,
  ): Promise<ImportResult> {
    try {
      const parseResult = fileType === "csv" ? await CsvUtils.parseCSV(buffer) : await CsvUtils.parseExcel(buffer)

      if (parseResult.errors.length > 0) {
        return {
          success: 0,
          errors: parseResult.errors,
          warnings: [],
        }
      }

      const validationResults = this.validateEventData(parseResult.data)

      if (validationResults.errors.length > 0) {
        return {
          success: 0,
          errors: validationResults.errors,
          warnings: validationResults.warnings,
        }
      }

      const importResult = await this.eventService.bulkImportEvents(validationResults.validData, createdBy, tenantId)

      return {
        success: importResult.success,
        errors: importResult.errors,
        warnings: validationResults.warnings,
      }
    } catch (error) {
      return {
        success: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings: [],
      }
    }
  }

  private validateMetricData(data: any[]): {
    validData: any[]
    errors: string[]
    warnings: string[]
  } {
    const validData: any[] = []
    const errors: string[] = []
    const warnings: string[] = []

    data.forEach((row, index) => {
      const rowErrors = CsvUtils.validateMetricData(row, index + 1)

      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
      } else {
        // Additional business logic validation
        const value = Number(row.value)

        if (value < 0) {
          warnings.push(`Row ${index + 1}: Negative value detected (${value})`)
        }

        if (Math.abs(value) > 1000000) {
          warnings.push(`Row ${index + 1}: Unusually large value detected (${value})`)
        }

        validData.push({
          metricName: row.metricName.trim(),
          value: value,
          date: row.date,
          period: row.period?.trim() || null,
        })
      }
    })

    return { validData, errors, warnings }
  }

  private validateEventData(data: any[]): {
    validData: any[]
    errors: string[]
    warnings: string[]
  } {
    const validData: any[] = []
    const errors: string[] = []
    const warnings: string[] = []

    data.forEach((row, index) => {
      const rowErrors = CsvUtils.validateEventData(row, index + 1)

      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
      } else {
        const startDate = new Date(row.startDate)
        const endDate = row.endDate ? new Date(row.endDate) : null

        // Additional validation
        if (endDate && endDate <= startDate) {
          errors.push(`Row ${index + 1}: End date must be after start date`)
          return
        }

        if (startDate > new Date()) {
          warnings.push(`Row ${index + 1}: Future event detected`)
        }

        validData.push({
          name: row.name.trim(),
          category: row.category.trim(),
          description: row.description?.trim() || null,
          startDate: row.startDate,
          endDate: row.endDate || null,
          impact: row.impact || "medium",
          metricNames: row.metricNames ? row.metricNames.split(",").map((name: string) => name.trim()) : [],
        })
      }
    })

    return { validData, errors, warnings }
  }

  async validateImportFile(
    buffer: Buffer,
    fileType: "csv" | "excel",
    dataType: "metrics" | "events",
  ): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    preview: any[]
  }> {
    try {
      const parseResult = fileType === "csv" ? await CsvUtils.parseCSV(buffer) : await CsvUtils.parseExcel(buffer)

      if (parseResult.errors.length > 0) {
        return {
          isValid: false,
          errors: parseResult.errors,
          warnings: [],
          preview: [],
        }
      }

      const preview = parseResult.data.slice(0, 5) // First 5 rows for preview

      const validationResults =
        dataType === "metrics" ? this.validateMetricData(parseResult.data) : this.validateEventData(parseResult.data)

      return {
        isValid: validationResults.errors.length === 0,
        errors: validationResults.errors,
        warnings: validationResults.warnings,
        preview,
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings: [],
        preview: [],
      }
    }
  }
}
