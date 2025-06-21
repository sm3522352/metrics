const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminId = uuidv4()
    const analystId = uuidv4()
    const viewerId = uuidv4()
    const tenantId = uuidv4()

    await queryInterface.bulkInsert("users", [
      {
        id: adminId,
        name: "Admin User",
        email: "admin@example.com",
        password_hash: await bcrypt.hash("admin123", 10),
        role: "admin",
        tenant_id: tenantId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: analystId,
        name: "Analyst User",
        email: "analyst@example.com",
        password_hash: await bcrypt.hash("analyst123", 10),
        role: "analyst",
        tenant_id: tenantId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: viewerId,
        name: "Viewer User",
        email: "viewer@example.com",
        password_hash: await bcrypt.hash("viewer123", 10),
        role: "viewer",
        tenant_id: tenantId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    // Store IDs for use in other seeders
    await queryInterface.sequelize.query(`
      CREATE TEMP TABLE IF NOT EXISTS seeder_data (
        key VARCHAR(50) PRIMARY KEY,
        value VARCHAR(255)
      );
    `)

    await queryInterface.bulkInsert("seeder_data", [
      { key: "admin_id", value: adminId },
      { key: "analyst_id", value: analystId },
      { key: "viewer_id", value: viewerId },
      { key: "tenant_id", value: tenantId },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {})
  },
}
