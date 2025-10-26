"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class email_jobs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // relation for users
      email_jobs.belongsTo(models.users, {
        foreignKey: "userId",
        allowNull: false,
      });

      // relation for campaign
      email_jobs.belongsTo(models.campaigns, {
        foreignKey: "campaignId",
        allowNull: false,
      });

      // relation for contact
      email_jobs.belongsTo(models.contacts, {
        foreignKey: "contactId",
        allowNull: false,
      });

      // relation for sender
      email_jobs.belongsTo(models.senders, {
        foreignKey: "senderId",
        allowNull: false,
      });

      email_jobs.hasOne(models.emails, {
        foreignKey: "jobId",
        allowNull: false,
      });
    }
  }
  email_jobs.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      campaignId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "campaigns",
          key: "id",
        },
      },

      contactId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "contacts",
          key: "id",
        },
      },

      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "senders",
          key: "id",
        },
      },

      // Contact info snapshot
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactFirstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contactLastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contactMetadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      // Sender info snapshot
      senderEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      senderName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      senderSmtpHost: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      senderSmtpPass: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      senderSmtpPort: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Email content snapshot
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      htmlContent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      textContent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Job metadata
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "QUEUED",
          "SENDING",
          "SENT",
          "FAILED",
          "CANCELLED",
          "BOUNCED"
        ),
        defaultValue: "PENDING",
        allowNull: false,
      },

      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      maxAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
      },

      scheduledFor: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      queuedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      sesMessageId: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      errorCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastErrorAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "email_jobs",
    }
  );
  return email_jobs;
};
