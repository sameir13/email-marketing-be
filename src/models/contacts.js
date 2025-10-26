"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class contacts extends Model {
    static associate(models) {
      contacts.hasMany(models.contact_tags, {
        foreignKey: "contactId",
        allowNull: false,
      });

      contacts.hasMany(models.emails, {
        foreignKey: "contactId",
        allowNull: false,
      });

      contacts.hasMany(models.email_jobs, {
        foreignKey: "contactId",
        allowNull: false,
      });
    }
  }
  contacts.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      listName: { type: DataTypes.STRING, allowNull: false },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      birthday: { type: DataTypes.STRING, allowNull: true },
      firstName: { type: DataTypes.STRING },
      lastName: { type: DataTypes.STRING },
      location: { type: DataTypes.STRING },
      company: { type: DataTypes.STRING },
      phone: { type: DataTypes.STRING },
      isUnsubscribed: { type: DataTypes.BOOLEAN, defaultValue: false },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      metadata: { type: DataTypes.JSONB },
    },
    {
      sequelize,
      modelName: "contacts",
      timestamps: true,
    }
  );
  return contacts;
};
