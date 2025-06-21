module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("events", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      impact: {
        type: Sequelize.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "medium",
      },
      status: {
        type: Sequelize.ENUM("planned", "active", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "planned",
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    })

    await queryInterface.addIndex("events", ["category"])
    await queryInterface.addIndex("events", ["start_date"])
    await queryInterface.addIndex("events", ["status"])
    await queryInterface.addIndex("events", ["tenant_id"])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("events")
  },
}
