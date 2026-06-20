const careLogs = [
  {
    logId: 1,
    plantId: 1,
    actionType: 'watering',
    notes: '',
    performedAt: '2024-05-01T08:00:00.000Z'
  },
  {
    logId: 2,
    plantId: 1,
    actionType: 'fertilizing',
    notes: 'Spring feed',
    performedAt: '2024-04-01T08:00:00.000Z'
  },
  {
    logId: 3,
    plantId: 3,
    actionType: 'watering',
    notes: '',
    performedAt: '2024-04-28T07:30:00.000Z'
  }
];

let nextLogId = 4;

const getByPlantId = (plantId) =>
  careLogs
    .filter((log) => log.plantId === plantId)
    .sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));

const create = ({ plantId, actionType, notes = '' }) => {
  const entry = {
    logId: nextLogId++,
    plantId,
    actionType,
    notes,
    performedAt: new Date().toISOString()
  };
  careLogs.push(entry);
  return entry;
};

module.exports = { getByPlantId, create };
