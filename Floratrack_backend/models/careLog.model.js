const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CareLog = sequelize.define('CareLog', {
    logId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    actionType: {
      type: DataTypes.ENUM('watering', 'fertilizing'),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    performedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'care_logs',
    timestamps: false
  });

  return CareLog;
};
