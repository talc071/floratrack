const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserSettings = sequelize.define('UserSettings', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    displayName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark'),
      allowNull: false,
      defaultValue: 'light'
    },
    language: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'English'
    },
    notificationsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'user_settings',
    timestamps: false
  });

  return UserSettings;
};
