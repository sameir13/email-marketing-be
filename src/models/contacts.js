"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class contacts extends Model {
    static associate(models) {
      contacts.hasMany(models.contact_tags, {
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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      gender: { type: DataTypes.STRING, allowNull: true },
      birthday: { type: DataTypes.STRING, allowNull: true },
      firstName: { type: DataTypes.STRING },
      lastName: { type: DataTypes.STRING },
      company: { type: DataTypes.STRING },
      phone: { type: DataTypes.STRING },
      isUnsubscribed: { type: DataTypes.BOOLEAN, defaultValue: false },
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
