const { Plant, CareLog } = require('../models');
const { sendSuccess, sendError } = require('../src/utils/response');
const { formatCareLog } = require('../src/utils/formatters');
const { emitToDashboard } = require('../src/socket/emitter');

const VALID_ACTIONS = ['watering', 'fertilizing'];

const logCareAction = async (req, res) => {
  const { plantId, actionType, notes } = req.body;

  if (!plantId || !actionType) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'plantId and actionType are required.', { fields: ['plantId', 'actionType'] });
  }

  const id = parseInt(plantId, 10);
  if (Number.isNaN(id)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'plantId must be a valid number.', { field: 'plantId' });
  }

  if (!VALID_ACTIONS.includes(actionType)) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Invalid actionType. Allowed values: ${VALID_ACTIONS.join(', ')}.`, { field: 'actionType' });
  }

  try {
    const plant = await Plant.findByPk(id);
    if (!plant) return sendError(res, 404, 'NOT_FOUND', `Plant with ID ${id} not found.`);

    const log = await CareLog.create({
      plantId: id,
      actionType,
      notes: notes || '',
      performedAt: new Date()
    });

    const plantUpdate = actionType === 'watering'
      ? { lastWatered: log.performedAt, updateDate: new Date() }
      : { lastFertilized: log.performedAt, updateDate: new Date() };

    await plant.update(plantUpdate);

    const formatted = formatCareLog(log);
    emitToDashboard('careLog:created', {
      careLog: formatted,
      plantId: id,
      plantName: plant.name,
      message: `${actionType} logged for "${plant.name}".`
    });

    sendSuccess(res, formatted, 201);
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

module.exports = { logCareAction };
