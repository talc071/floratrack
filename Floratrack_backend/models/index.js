const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env] || config['development'];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define
  }
);

const User = require('./user.model')(sequelize);
const Admin = require('./admin.model')(sequelize);
const Plant = require('./plant.model')(sequelize);
const CareLog = require('./careLog.model')(sequelize);
const UserPlant = require('./userPlant.model')(sequelize);
const UserSettings = require('./userSettings.model')(sequelize);

// One-to-Many: User owns many Plants
User.hasMany(Plant, { foreignKey: 'userId', as: 'ownedPlants' });
Plant.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Many-to-Many: Users share Plants through UserPlant junction
User.belongsToMany(Plant, { through: UserPlant, foreignKey: 'userId', otherKey: 'plantId', as: 'sharedPlants' });
Plant.belongsToMany(User, { through: UserPlant, foreignKey: 'plantId', otherKey: 'userId', as: 'sharedWith' });
UserPlant.belongsTo(User, { foreignKey: 'userId' });
UserPlant.belongsTo(Plant, { foreignKey: 'plantId' });

// One-to-Many: Plant has many CareLogs
Plant.hasMany(CareLog, { foreignKey: 'plantId', as: 'careLogs' });
CareLog.belongsTo(Plant, { foreignKey: 'plantId', as: 'plant' });

// Admin profile linked to User
User.hasOne(Admin, { foreignKey: 'userId', as: 'adminProfile' });
Admin.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User settings
User.hasOne(UserSettings, { foreignKey: 'userId', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Admin,
  Plant,
  CareLog,
  UserPlant,
  UserSettings
};
