-- FloraTrack initial schema (Assignment 4)
-- Run after creating database: CREATE DATABASE floratrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  userRole ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
  createDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  adminId INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Operations',
  permissionsLevel ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin',
  createDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plants (
  plantId INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  species VARCHAR(200) NOT NULL,
  location VARCHAR(100) NOT NULL,
  wateringFrequencyDays INT NOT NULL DEFAULT 7,
  lastWatered DATETIME NULL,
  lastFertilized DATETIME NULL,
  healthStatus ENUM('healthy', 'needs-attention', 'critical') NOT NULL DEFAULT 'healthy',
  notes TEXT,
  createDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS care_logs (
  logId INT AUTO_INCREMENT PRIMARY KEY,
  plantId INT NOT NULL,
  actionType ENUM('watering', 'fertilizing') NOT NULL,
  notes TEXT,
  performedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plantId) REFERENCES plants(plantId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_plants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  plantId INT NOT NULL,
  accessLevel ENUM('viewer', 'editor') NOT NULL DEFAULT 'viewer',
  sharedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_plant (userId, plantId),
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  FOREIGN KEY (plantId) REFERENCES plants(plantId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
  userId INT PRIMARY KEY,
  displayName VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  theme ENUM('light', 'dark') NOT NULL DEFAULT 'light',
  language VARCHAR(50) NOT NULL DEFAULT 'English',
  notificationsEnabled TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE INDEX idx_plants_userId ON plants(userId);
CREATE INDEX idx_plants_healthStatus ON plants(healthStatus);
CREATE INDEX idx_care_logs_plantId ON care_logs(plantId);
