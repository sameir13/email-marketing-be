"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class campaigns extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      campaigns.hasMany(models.templates, {
        foreignKey: "templateId",
        allowNull: false,
      });

      campaigns.belongsTo(models.users, {
        foreignKey: "userId",
        allowNull: false,
      });

      campaigns.hasMany(models.emails, {
        foreignKey: "campaignId",
        allowNull: false,
      });

      campaigns.hasMany(models.email_jobs, {
        foreignKey: "campaignId",
        allowNull: false,
      });
    }
  }
  campaigns.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      subject: { type: DataTypes.STRING, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "scheduled",
          "running",
          "paused",
          "completed",
          "failed"
        ),
        defaultValue: "draft",
      },
      contactIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
        defaultValue: [],
      },
      senderIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
        defaultValue: [],
      },

      timezone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "UTC",
      },

      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "templates", key: "id" },
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },

      startDate: { type: DataTypes.DATE, allowNull: false },
      startTime: { type: DataTypes.STRING, allowNull: false },

      scheduledAt: { type: DataTypes.DATE },
      completedAt: { type: DataTypes.DATE },
      totalContacts: { type: DataTypes.INTEGER, defaultValue: 0 },
      sentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      failedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "campaigns",
      timestamps: true,
    }
  );
  return campaigns;
};
