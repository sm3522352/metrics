module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("admin", "analyst", "viewer"),
        allowNull: false,
        defaultValue: "viewer",
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      last_login_at: {
        type: Sequelize.DATE,
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
        allowNull: true,
      },
    })

    await queryInterface.addIndex("users", ["email"], { unique: true })
    await queryInterface.addIndex("users", ["tenant_id"])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users")
  },
}
