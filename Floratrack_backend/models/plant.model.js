const { DataTypes } = require('sequelize');

const VALID_HEALTH_STATUSES = ['healthy', 'needs-attention', 'critical'];

module.exports = (sequelize) => {
  const Plant = sequelize.define('Plant', {
    plantId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    species: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    wateringFrequencyDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7
    },
    lastWatered: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastFertilized: {
      type: DataTypes.DATE,
      allowNull: true
    },
    healthStatus: {
      type: DataTypes.ENUM(...VALID_HEALTH_STATUSES),
      allowNull: false,
      defaultValue: 'healthy'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    createDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updateDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'plants',
    timestamps: false
  });

  Plant.VALID_HEALTH_STATUSES = VALID_HEALTH_STATUSES;
  return Plant;
};
