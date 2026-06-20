const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPlant = sequelize.define('UserPlant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    accessLevel: {
      type: DataTypes.ENUM('viewer', 'editor'),
      allowNull: false,
      defaultValue: 'viewer'
    },
    sharedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_plants',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['userId', 'plantId'] }
    ]
  });

  return UserPlant;
};
