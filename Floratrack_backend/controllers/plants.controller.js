const { Op } = require('sequelize');
const { Plant, User, CareLog } = require('../models');
const { sendSuccess, sendError, parseId } = require('../src/utils/response');
const { formatPlant, formatPlants, formatCareLogs, formatUser, formatSharedUser } = require('../src/utils/formatters');
const { emitToDashboard } = require('../src/socket/emitter');

const VALID_HEALTH_STATUSES = Plant.VALID_HEALTH_STATUSES;

const getAllPlants = async (req, res) => {
  const { userId, healthStatus, location } = req.query;

  if (healthStatus && !VALID_HEALTH_STATUSES.includes(healthStatus)) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Invalid healthStatus. Allowed values: ${VALID_HEALTH_STATUSES.join(', ')}.`, { field: 'healthStatus' });
  }

  try {
    const where = {};
    const headerUserId = parseId(req.headers['x-user-id']);
    const userRole = req.headers['x-user-role'];
    const canViewAll = userRole === 'admin' || userRole === 'manager';

    if (userId) where.userId = parseId(userId);
    else if (headerUserId && !canViewAll) where.userId = headerUserId;
    if (healthStatus) where.healthStatus = healthStatus;
    if (location) where.location = { [Op.like]: location };

    const plants = await Plant.findAll({ where, order: [['plantId', 'ASC']] });
    sendSuccess(res, formatPlants(plants));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const getPlantById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, 'VALIDATION_ERROR', 'Plant ID must be a valid number.', { param: 'id' });

  try {
    const plant = await Plant.findByPk(id);
    if (!plant) return sendError(res, 404, 'NOT_FOUND', `Plant with ID ${id} not found.`);
    sendSuccess(res, formatPlant(plant));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const getPlantHistory = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, 'VALIDATION_ERROR', 'Plant ID must be a valid number.', { param: 'id' });

  try {
    const plant = await Plant.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'userRole']
        },
        {
          model: User,
          as: 'sharedWith',
          attributes: ['userId', 'firstName', 'lastName', 'email'],
          through: { attributes: ['accessLevel', 'sharedAt'] }
        },
        {
          model: CareLog,
          as: 'careLogs',
          separate: true,
          order: [['performedAt', 'DESC']]
        }
      ]
    });

    if (!plant) return sendError(res, 404, 'NOT_FOUND', `Plant with ID ${id} not found.`);

    const plain = plant.get({ plain: true });
    sendSuccess(res, {
      plant: formatPlant(plant),
      owner: formatUser(plain.owner),
      sharedUsers: (plain.sharedWith || []).map(formatSharedUser),
      careLogs: formatCareLogs(plain.careLogs || [])
    });
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const getPlantsByUser = async (req, res) => {
  const userId = parseId(req.params.userId);
  if (!userId) return sendError(res, 400, 'VALIDATION_ERROR', 'User ID must be a valid number.', { param: 'userId' });

  try {
    const user = await User.findByPk(userId);
    if (!user) return sendError(res, 404, 'NOT_FOUND', `User with ID ${userId} not found.`);

    const plants = await Plant.findAll({ where: { userId }, order: [['plantId', 'ASC']] });
    sendSuccess(res, formatPlants(plants));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const createPlant = async (req, res) => {
  const { userId, name, species, location, wateringFrequencyDays, lastWatered, lastFertilized, healthStatus, notes } = req.body;

  const missing = ['userId', 'name', 'species', 'location'].filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
  );
  if (missing.length) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}.`, { fields: missing });
  }

  const parsedUserId = parseId(userId);
  if (!parsedUserId) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'userId must be a valid number.', { field: 'userId' });
  }

  if (healthStatus && !VALID_HEALTH_STATUSES.includes(healthStatus)) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Invalid healthStatus. Allowed values: ${VALID_HEALTH_STATUSES.join(', ')}.`, { field: 'healthStatus' });
  }

  try {
    const user = await User.findByPk(parsedUserId);
    if (!user) return sendError(res, 404, 'NOT_FOUND', `User with ID ${parsedUserId} not found.`);

    const now = new Date();
    const plant = await Plant.create({
      userId: parsedUserId,
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
    });

    const formatted = formatPlant(plant);
    emitToDashboard('plant:created', { plant: formatted, message: `New plant "${name}" was added.` });

    sendSuccess(res, { plantId: plant.plantId }, 201);
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const updatePlant = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, 'VALIDATION_ERROR', 'Plant ID must be a valid number.', { param: 'id' });

  const { name, species, location, wateringFrequencyDays, lastWatered, lastFertilized, healthStatus, notes } = req.body;

  const missing = ['name', 'species', 'location'].filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
  );
  if (missing.length) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}.`, { fields: missing });
  }

  if (healthStatus && !VALID_HEALTH_STATUSES.includes(healthStatus)) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Invalid healthStatus. Allowed values: ${VALID_HEALTH_STATUSES.join(', ')}.`, { field: 'healthStatus' });
  }

  try {
    const plant = await Plant.findByPk(id);
    if (!plant) return sendError(res, 404, 'NOT_FOUND', `Plant with ID ${id} not found.`);

    await plant.update({
      name,
      species,
      location,
      wateringFrequencyDays,
      lastWatered,
      lastFertilized,
      healthStatus,
      notes,
      updateDate: new Date()
    });

    const formatted = formatPlant(plant);
    emitToDashboard('plant:updated', { plant: formatted, message: `Plant "${name}" was updated.` });

    sendSuccess(res, { plantId: plant.plantId });
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const deletePlant = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, 'VALIDATION_ERROR', 'Plant ID must be a valid number.', { param: 'id' });

  try {
    const plant = await Plant.findByPk(id);
    if (!plant) return sendError(res, 404, 'NOT_FOUND', `Plant with ID ${id} not found.`);

    const plantId = plant.plantId;
    const plantName = plant.name;
    await plant.destroy();

    emitToDashboard('plant:deleted', { plantId, message: `Plant "${plantName}" was deleted.` });

    sendSuccess(res, { plantId });
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

module.exports = { getAllPlants, getPlantById, getPlantHistory, getPlantsByUser, createPlant, updatePlant, deletePlant };
