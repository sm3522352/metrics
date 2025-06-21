module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("metrics", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      display_name: {
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
      unit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      frequency: {
        type: Sequelize.ENUM("daily", "weekly", "monthly", "quarterly", "yearly"),
        allowNull: false,
        defaultValue: "monthly",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex("metrics", ["name"], { unique: true })
    await queryInterface.addIndex("metrics", ["category"])
    await queryInterface.addIndex("metrics", ["tenant_id"])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("metrics")
  },
}
