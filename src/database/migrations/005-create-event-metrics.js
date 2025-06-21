module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_metrics", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "events",
          key: "id",
        },
        onDelete: "CASCADE",
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
      expected_impact: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      actual_impact: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      correlation: {
        type: Sequelize.DECIMAL(5, 4),
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
    })

    await queryInterface.addIndex("event_metrics", ["event_id", "metric_id"], { unique: true })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("event_metrics")
  },
}
