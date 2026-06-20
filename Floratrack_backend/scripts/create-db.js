require('dotenv').config();
const { Sequelize } = require('sequelize');

async function createDatabase() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  const sequelize = new Sequelize('', DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false
  });

  try {
    await sequelize.authenticate();
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database "${DB_NAME}" is ready.`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create database:', err.message);
    process.exit(1);
  }
}

createDatabase();
