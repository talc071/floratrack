const plants = [
  {
    plantId: 1,
    userId: 3,
    name: 'Monstera',
    species: 'Monstera deliciosa',
    location: 'Living Room',
    wateringFrequencyDays: 7,
    lastWatered: '2024-05-01T08:00:00.000Z',
    lastFertilized: '2024-04-01T08:00:00.000Z',
    healthStatus: 'healthy',
    notes: 'Growing beautifully near the window.',
    createDate: '2024-01-10T09:00:00.000Z',
    updateDate: '2024-05-01T08:00:00.000Z'
  },
  {
    plantId: 2,
    userId: 3,
    name: 'Cactus',
    species: 'Echinopsis pachanoi',
    location: 'Bedroom',
    wateringFrequencyDays: 14,
    lastWatered: '2024-04-20T10:00:00.000Z',
    lastFertilized: '2024-03-15T10:00:00.000Z',
    healthStatus: 'healthy',
    notes: 'Very low maintenance, thrives on neglect.',
    createDate: '2024-02-01T12:00:00.000Z',
    updateDate: '2024-04-20T10:00:00.000Z'
  },
  {
    plantId: 3,
    userId: 4,
    name: 'Peace Lily',
    species: 'Spathiphyllum wallisii',
    location: 'Office',
    wateringFrequencyDays: 5,
    lastWatered: '2024-04-28T07:30:00.000Z',
    lastFertilized: '2024-04-10T07:30:00.000Z',
    healthStatus: 'needs-attention',
    notes: 'Leaves drooping slightly, may need more frequent watering.',
    createDate: '2024-03-05T10:00:00.000Z',
    updateDate: '2024-04-28T07:30:00.000Z'
  },
  {
    plantId: 4,
    userId: 2,
    name: 'Fiddle Leaf Fig',
    species: 'Ficus lyrata',
    location: 'Balcony',
    wateringFrequencyDays: 6,
    lastWatered: '2024-04-30T09:00:00.000Z',
    lastFertilized: '2024-04-15T09:00:00.000Z',
    healthStatus: 'healthy',
    notes: 'Loving the morning sun on the balcony.',
    createDate: '2024-01-20T08:00:00.000Z',
    updateDate: '2024-04-30T09:00:00.000Z'
  },
  {
    plantId: 5,
    userId: 1,
    name: 'Aloe Vera',
    species: 'Aloe barbadensis miller',
    location: 'Kitchen',
    wateringFrequencyDays: 10,
    lastWatered: '2024-04-25T11:00:00.000Z',
    lastFertilized: null,
    healthStatus: 'healthy',
    notes: 'Handy for minor burns. Thriving in the sunny kitchen spot.',
    createDate: '2024-01-15T09:00:00.000Z',
    updateDate: '2024-04-25T11:00:00.000Z'
  },
  {
    plantId: 6,
    userId: 5,
    name: 'Snake Plant',
    species: 'Dracaena trifasciata',
    location: 'Bedroom',
    wateringFrequencyDays: 21,
    lastWatered: '2024-04-10T08:00:00.000Z',
    lastFertilized: null,
    healthStatus: 'critical',
    notes: 'Overwatered — root rot suspected. Repotting scheduled.',
    createDate: '2024-03-01T09:00:00.000Z',
    updateDate: '2024-04-10T08:00:00.000Z'
  }
];

let nextPlantId = 7;

const VALID_HEALTH_STATUSES = ['healthy', 'needs-attention', 'critical'];

const getAll = ({ userId, healthStatus, location } = {}) => {
  let result = plants;
  if (userId) result = result.filter((p) => p.userId === Number(userId));
  if (healthStatus) result = result.filter((p) => p.healthStatus === healthStatus);
  if (location) result = result.filter((p) => p.location.toLowerCase() === location.toLowerCase());
  return result;
};

const getById = (id) => plants.find((p) => p.plantId === id);

const getByUserId = (userId) => plants.filter((p) => p.userId === userId);

const create = ({ userId, name, species, location, wateringFrequencyDays, lastWatered, lastFertilized, healthStatus, notes }) => {
  const now = new Date().toISOString();
  const newPlant = {
    plantId: nextPlantId++,
    userId,
    name,
    species,
    location,
    wateringFrequencyDays: wateringFrequencyDays ?? 7,
    lastWatered: lastWatered ?? null,
    lastFertilized: lastFertilized ?? null,
    healthStatus: healthStatus ?? 'healthy',
    notes: notes ?? '',
    createDate: now,
    updateDate: now
  };
  plants.push(newPlant);
  return newPlant;
};

const update = (id, fields) => {
  const idx = plants.findIndex((p) => p.plantId === id);
  if (idx === -1) return null;
  plants[idx] = {
    ...plants[idx],
    ...fields,
    plantId: plants[idx].plantId,
    userId: plants[idx].userId,
    createDate: plants[idx].createDate,
    updateDate: new Date().toISOString()
  };
  return plants[idx];
};

const remove = (id) => {
  const idx = plants.findIndex((p) => p.plantId === id);
  if (idx === -1) return null;
  const [removed] = plants.splice(idx, 1);
  return removed;
};

module.exports = { getAll, getById, getByUserId, create, update, remove, VALID_HEALTH_STATUSES };
