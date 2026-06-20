require('dotenv').config();

const { sequelize, User, Admin, Plant, CareLog, UserPlant, UserSettings } = require('../models');

const seedUsers = [
  { firstName: 'Alice', lastName: 'Green', email: 'alice@floratrack.com', password: 'admin123', userRole: 'admin' },
  { firstName: 'Bob', lastName: 'Bloom', email: 'bob@floratrack.com', password: 'manager123', userRole: 'manager' },
  { firstName: 'Carol', lastName: 'Rose', email: 'carol@floratrack.com', password: 'user123', userRole: 'user' },
  { firstName: 'David', lastName: 'Fern', email: 'david@floratrack.com', password: 'user123', userRole: 'user' },
  { firstName: 'Eva', lastName: 'Sprout', email: 'eva@floratrack.com', password: 'user123', userRole: 'user' }
];

const seedPlants = [
  { userIndex: 2, name: 'Monstera', species: 'Monstera deliciosa', location: 'Living Room', wateringFrequencyDays: 7, lastWatered: '2024-05-01T08:00:00.000Z', lastFertilized: '2024-04-01T08:00:00.000Z', healthStatus: 'healthy', notes: 'Growing beautifully near the window.' },
  { userIndex: 2, name: 'Cactus', species: 'Echinopsis pachanoi', location: 'Bedroom', wateringFrequencyDays: 14, lastWatered: '2024-04-20T10:00:00.000Z', lastFertilized: '2024-03-15T10:00:00.000Z', healthStatus: 'healthy', notes: 'Very low maintenance, thrives on neglect.' },
  { userIndex: 3, name: 'Peace Lily', species: 'Spathiphyllum wallisii', location: 'Office', wateringFrequencyDays: 5, lastWatered: '2024-04-28T07:30:00.000Z', lastFertilized: '2024-04-10T07:30:00.000Z', healthStatus: 'needs-attention', notes: 'Leaves drooping slightly, may need more frequent watering.' },
  { userIndex: 1, name: 'Fiddle Leaf Fig', species: 'Ficus lyrata', location: 'Balcony', wateringFrequencyDays: 6, lastWatered: '2024-04-30T09:00:00.000Z', lastFertilized: '2024-04-15T09:00:00.000Z', healthStatus: 'healthy', notes: 'Loving the morning sun on the balcony.' },
  { userIndex: 0, name: 'Aloe Vera', species: 'Aloe barbadensis miller', location: 'Kitchen', wateringFrequencyDays: 10, lastWatered: '2024-04-25T11:00:00.000Z', lastFertilized: null, healthStatus: 'healthy', notes: 'Handy for minor burns. Thriving in the sunny kitchen spot.' },
  { userIndex: 4, name: 'Snake Plant', species: 'Dracaena trifasciata', location: 'Bedroom', wateringFrequencyDays: 21, lastWatered: '2024-04-10T08:00:00.000Z', lastFertilized: null, healthStatus: 'critical', notes: 'Overwatered — root rot suspected. Repotting scheduled.' }
];

const seedCareLogs = [
  { plantIndex: 0, actionType: 'watering', notes: '', performedAt: '2024-05-01T08:00:00.000Z' },
  { plantIndex: 0, actionType: 'fertilizing', notes: 'Spring feed', performedAt: '2024-04-01T08:00:00.000Z' },
  { plantIndex: 2, actionType: 'watering', notes: '', performedAt: '2024-04-28T07:30:00.000Z' }
];

const seedShares = [
  { userIndex: 1, plantIndex: 0, accessLevel: 'editor' },
  { userIndex: 3, plantIndex: 0, accessLevel: 'viewer' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('Database schema synced.');

    const users = [];
    for (const u of seedUsers) {
      const user = await User.create({
        ...u,
        createDate: new Date(),
        updateDate: new Date()
      });
      users.push(user);

      await UserSettings.create({
        userId: user.userId,
        displayName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        theme: u.email === 'eva@floratrack.com' ? 'dark' : 'light',
        language: 'English',
        notificationsEnabled: u.email !== 'david@floratrack.com'
      });

      if (u.userRole === 'admin') {
        await Admin.create({
          userId: user.userId,
          department: 'Platform Operations',
          permissionsLevel: 'super_admin',
          createDate: new Date()
        });
      }
    }

    const plants = [];
    for (const p of seedPlants) {
      const plant = await Plant.create({
        userId: users[p.userIndex].userId,
        name: p.name,
        species: p.species,
        location: p.location,
        wateringFrequencyDays: p.wateringFrequencyDays,
        lastWatered: p.lastWatered,
        lastFertilized: p.lastFertilized,
        healthStatus: p.healthStatus,
        notes: p.notes,
        createDate: new Date(),
        updateDate: new Date()
      });
      plants.push(plant);
    }

    for (const log of seedCareLogs) {
      await CareLog.create({
        plantId: plants[log.plantIndex].plantId,
        actionType: log.actionType,
        notes: log.notes,
        performedAt: new Date(log.performedAt)
      });
    }

    for (const share of seedShares) {
      await UserPlant.create({
        userId: users[share.userIndex].userId,
        plantId: plants[share.plantIndex].plantId,
        accessLevel: share.accessLevel,
        sharedAt: new Date()
      });
    }

    console.log('Seed data inserted successfully.');
    console.log(`  Users: ${users.length}, Plants: ${plants.length}, Care logs: ${seedCareLogs.length}, Shares: ${seedShares.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
