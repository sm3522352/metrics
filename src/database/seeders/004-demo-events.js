const { v4: uuidv4 } = require("uuid")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin ID and tenant ID
    const [adminResults] = await queryInterface.sequelize.query("SELECT value FROM seeder_data WHERE key = 'admin_id'")
    const adminId = adminResults[0]?.value

    const [tenantResults] = await queryInterface.sequelize.query(
      "SELECT value FROM seeder_data WHERE key = 'tenant_id'",
    )
    const tenantId = tenantResults[0]?.value

    if (!adminId || !tenantId) {
      throw new Error("Admin ID or Tenant ID not found from previous seeder")
    }

    const events = [
      {
        id: uuidv4(),
        name: "Q1 Marketing Campaign",
        category: "marketing",
        description: "Large-scale digital marketing campaign for Q1",
        start_date: new Date("2023-01-15"),
        end_date: new Date("2023-03-31"),
        impact: "high",
        status: "completed",
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Product Feature Launch",
        category: "product",
        description: "Launch of new premium features",
        start_date: new Date("2023-04-01"),
        end_date: new Date("2023-04-30"),
        impact: "high",
        status: "completed",
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Customer Support Improvement",
        category: "operations",
        description: "Implementation of new customer support system",
        start_date: new Date("2023-06-01"),
        end_date: new Date("2023-07-31"),
        impact: "medium",
        status: "completed",
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Pricing Strategy Update",
        category: "finance",
        description: "Revision of pricing strategy and plans",
        start_date: new Date("2023-09-01"),
        end_date: new Date("2023-09-30"),
        impact: "high",
        status: "completed",
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Holiday Season Campaign",
        category: "marketing",
        description: "Special holiday season promotional campaign",
        start_date: new Date("2023-11-01"),
        end_date: new Date("2023-12-31"),
        impact: "high",
        status: "completed",
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Q1 2024 Expansion",
        category: "growth",
        description: "Market expansion into new regions",
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-03-31"),
        impact: "high",
        status: "active",
        tenant_id: tenantId,
        created_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await queryInterface.bulkInsert("events", events)

    // Store event IDs for use in other seeders
    for (let i = 0; i < events.length; i++) {
      await queryInterface.bulkInsert("seeder_data", [{ key: `event_${i}_id`, value: events[i].id }])
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("events", null, {})
  },
}
