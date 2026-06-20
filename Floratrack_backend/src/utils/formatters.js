const toPlain = (instance) => (instance?.get ? instance.get({ plain: true }) : instance);

const formatUser = (user) => {
  if (!user) return null;
  const u = toPlain(user);
  const { password, ...publicUser } = u;
  return publicUser;
};

const formatUsers = (users) => users.map(formatUser);

const formatPlant = (plant) => {
  if (!plant) return null;
  const p = toPlain(plant);
  return {
    plantId: p.plantId,
    userId: p.userId,
    name: p.name,
    species: p.species,
    location: p.location,
    wateringFrequencyDays: p.wateringFrequencyDays,
    lastWatered: p.lastWatered,
    lastFertilized: p.lastFertilized,
    healthStatus: p.healthStatus,
    notes: p.notes || '',
    createDate: p.createDate,
    updateDate: p.updateDate
  };
};

const formatPlants = (plants) => plants.map(formatPlant);

const formatCareLog = (log) => {
  if (!log) return null;
  const l = toPlain(log);
  return {
    logId: l.logId,
    plantId: l.plantId,
    actionType: l.actionType,
    notes: l.notes || '',
    performedAt: l.performedAt
  };
};

const formatCareLogs = (logs) => logs.map(formatCareLog);

const formatSharedUser = (user) => {
  if (!user) return null;
  const u = toPlain(user);
  const through = u.UserPlant || u.user_plants;
  return {
    userId: u.userId,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    accessLevel: through?.accessLevel || 'viewer',
    sharedAt: through?.sharedAt || null
  };
};

module.exports = {
  formatUser,
  formatUsers,
  formatPlant,
  formatPlants,
  formatCareLog,
  formatCareLogs,
  formatSharedUser
};
