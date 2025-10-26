"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class emails extends Model {
    static associate(models) {

      emails.belongsTo(models.campaigns, {
        foreignKey: "campaignId",
        allowNull: false,
      });


      emails.belongsTo(models.contacts, {
        foreignKey: "contactId",
        allowNull: false,
      });

      emails.belongsTo(models.senders, {
        foreignKey: "senderId",
        allowNull: false,
      });

      emails.belongsTo(models.email_jobs, {
        foreignKey: "jobId",
        allowNull: false,
      });

    }
  }
  emails.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      campaignId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "campaigns", key: "id" },
      },

      contactId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "contacts", key: "id" },
      },


      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "email_jobs", key: "id" },
      },


      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "senders", key: "id" },
      },

      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },

      messageId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      senderEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },

      status: {
        type: DataTypes.ENUM(
          // "pending",
          "sent",
          "failed",
          "bounced",
          // "opened",
          // "clicked"
        ),
        allowNull: false,
        defaultValue: "pending",
      },

      errorMessage: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      isBounced: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
      },

      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      openedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      retryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "emails",
    }
  );
  return emails;
};
