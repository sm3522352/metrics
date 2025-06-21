module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("metric_values", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      metric_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "metrics",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      value: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      period: {
        type: Sequelize.STRING,
        allowNull: true,
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

    await queryInterface.addIndex("metric_values", ["metric_id", "date"], { unique: true })
    await queryInterface.addIndex("metric_values", ["date"])
    await queryInterface.addIndex("metric_values", ["tenant_id"])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("metric_values")
  },
}
