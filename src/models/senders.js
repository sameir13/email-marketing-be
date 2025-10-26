"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class senders extends Model {
    static associate(models) {
      senders.belongsTo(models.users, {
        foreignKey: "userId",
        allowNull: false,
      });

      senders.hasMany(models.emails, {
        foreignKey: "senderId",
        allowNull: false,
      });

      senders.hasMany(models.email_jobs, {
        foreignKey: "senderId",
        allowNull: false,
      });
    }
  }
  senders.init(
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

      provider: {
        type: DataTypes.ENUM("ses", "gmail", "testing"),
        allowNull: false,
      },

      fromName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      fromEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },

      smtpHost: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      smtpPort: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      smtpUser: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      smtpPass: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      region: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "pending_verification",
          "verified",
          "inactive",
          "error"
        ),
        defaultValue: "pending_verification",
      },

      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      dkimVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      spfVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      domainVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      rateLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "senders",
    }
  );
  return senders;
};
