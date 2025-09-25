'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
 
    static associate(models) {
      users.hasMany(models.contact_tags, {
        foreignKey: "userId",
        allowNull: false,
      });

      users.hasMany(models.campaigns, {
        foreignKey: "userId",
        allowNull: false,
      });
      
      users.hasMany(models.senders, {
        foreignKey: "userId",
        allowNull: false,
      });
    }
  }
  users.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    profile_photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: "UTC",
    },
    status: {
      type: DataTypes.ENUM("active", "banned"),
      defaultValue: "active",
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};