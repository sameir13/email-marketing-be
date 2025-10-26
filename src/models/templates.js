"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class templates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      templates.belongsTo(models.campaigns, {
        foreignKey: "templateId",
        allowNull: false,
      });
    }
  }
  templates.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM("textEmail", "designTemplate"),
        allowNull: false,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      htmlContent: { type: DataTypes.TEXT, allowNull: false },
      designJson: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          const rawValue = this.getDataValue("designJson");
          try {
            return JSON.parse(rawValue);
          } catch {
            return rawValue;
          }
        },
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "templates",
      timestamps: true,
    }
  );
  return templates;
};
