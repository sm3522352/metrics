const { v4: uuidv4 } = require("uuid")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user ID from previous seeder
    const [results] = await queryInterface.sequelize.query("SELECT value FROM seeder_data WHERE key = 'admin_id'")
    const adminId = results[0]?.value

    const [tenantResults] = await queryInterface.sequelize.query(
      "SELECT value FROM seeder_data WHERE key = 'tenant_id'",
    )
    const tenantId = tenantResults[0]?.value

    if (!adminId || !tenantId) {
      throw new Error("Admin ID or Tenant ID not found from previous seeder")
    }

    const metrics = [
      {
        id: uuidv4(),
        name: "revenue",
        display_name: "Monthly Revenue",
        category: "financial",
        description: "Total monthly revenue in USD",
        unit: "USD",
        frequency: "monthly",
        is_active: true,
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "customers",
        display_name: "Active Customers",
        category: "growth",
        description: "Number of active customers",
        unit: "count",
        frequency: "monthly",
        is_active: true,
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "conversion_rate",
        display_name: "Conversion Rate",
        category: "marketing",
        description: "Lead to customer conversion rate",
        unit: "%",
        frequency: "monthly",
        is_active: true,
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "churn_rate",
        display_name: "Churn Rate",
        category: "retention",
        description: "Monthly customer churn rate",
        unit: "%",
        frequency: "monthly",
        is_active: true,
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "avg_order_value",
        display_name: "Average Order Value",
        category: "financial",
        description: "Average value per order",
        unit: "USD",
        frequency: "monthly",
        is_active: true,
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await queryInterface.bulkInsert("metrics", metrics)

    // Store metric IDs for use in other seeders
    for (const metric of metrics) {
      await queryInterface.bulkInsert("seeder_data", [{ key: `metric_${metric.name}_id`, value: metric.id }])
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("metrics", null, {})
  },
}
