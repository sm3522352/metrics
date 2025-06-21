const { v4: uuidv4 } = require("uuid")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get metric IDs and admin ID
    const [adminResults] = await queryInterface.sequelize.query("SELECT value FROM seeder_data WHERE key = 'admin_id'")
    const adminId = adminResults[0]?.value

    const [tenantResults] = await queryInterface.sequelize.query(
      "SELECT value FROM seeder_data WHERE key = 'tenant_id'",
    )
    const tenantId = tenantResults[0]?.value

    const [metricResults] = await queryInterface.sequelize.query(
      "SELECT key, value FROM seeder_data WHERE key LIKE 'metric_%_id'",
    )

    if (!adminId || !tenantId || metricResults.length === 0) {
      throw new Error("Required IDs not found from previous seeders")
    }

    const metricIds = {}
    metricResults.forEach((row) => {
      const metricName = row.key.replace("metric_", "").replace("_id", "")
      metricIds[metricName] = row.value
    })

    const metricValues = []
    const startDate = new Date("2023-01-01")
    const endDate = new Date("2024-12-31")

    // Generate sample data for each metric
    const metricData = {
      revenue: { base: 100000, trend: 1.05, volatility: 0.1 },
      customers: { base: 1000, trend: 1.03, volatility: 0.05 },
      conversion_rate: { base: 2.5, trend: 1.01, volatility: 0.15 },
      churn_rate: { base: 5.0, trend: 0.98, volatility: 0.12 },
      avg_order_value: { base: 150, trend: 1.02, volatility: 0.08 },
    }

    for (const [metricName, config] of Object.entries(metricData)) {
      if (!metricIds[metricName]) continue

      const currentDate = new Date(startDate)
      let currentValue = config.base

      while (currentDate <= endDate) {
        // Add trend and random volatility
        const trendFactor = config.trend
        const volatilityFactor = 1 + (Math.random() - 0.5) * 2 * config.volatility

        currentValue = currentValue * trendFactor * volatilityFactor

        metricValues.push({
          id: uuidv4(),
          metric_id: metricIds[metricName],
          value: Math.round(currentValue * 100) / 100,
          date: currentDate.toISOString().split("T")[0],
          period: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
          tenant_id: tenantId,
          created_by: adminId,
          created_at: new Date(),
          updated_at: new Date(),
        })

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    // Insert in batches to avoid memory issues
    const batchSize = 100
    for (let i = 0; i < metricValues.length; i += batchSize) {
      const batch = metricValues.slice(i, i + batchSize)
      await queryInterface.bulkInsert("metric_values", batch)
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("metric_values", null, {})
  },
}
