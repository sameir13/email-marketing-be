"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class contact_tags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      contact_tags.belongsTo(models.users, {
        foreignKey: "userId",
        allowNull: false,
      });

      contact_tags.belongsTo(models.contacts, {
        foreignKey: "contactId",
        allowNull: false,
      });
    }
  }
  contact_tags.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },

      contactId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "contacts", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "contact_tags",
      timestamps: true,
    }
  );
  return contact_tags;
};
