const { Op } = require('sequelize');
const { User, UserSettings } = require('../models');
const { sendSuccess, sendError, parseId } = require('../src/utils/response');
const { formatUser, formatUsers } = require('../src/utils/formatters');

const VALID_ROLES = ['admin', 'manager', 'user'];

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['userId', 'ASC']] });
    sendSuccess(res, formatUsers(users));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const getUserById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, 'VALIDATION_ERROR', 'User ID must be a valid number.', { param: 'id' });

  try {
    const user = await User.findByPk(id);
    if (!user) return sendError(res, 404, 'NOT_FOUND', `User with ID ${id} not found.`);
    sendSuccess(res, formatUser(user));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const createUser = async (req, res) => {
  const { firstName, lastName, userRole } = req.body;

  const missing = ['firstName', 'lastName', 'userRole'].filter((f) => !req.body[f]);
  if (missing.length) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}.`, { fields: missing });
  }

  if (!VALID_ROLES.includes(userRole)) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Invalid userRole. Allowed values: ${VALID_ROLES.join(', ')}.`, { field: 'userRole', allowed: VALID_ROLES });
  }

  try {
    const now = new Date();
    const user = await User.create({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}@floratrack.com`,
      password: 'changeme',
      userRole,
      createDate: now,
      updateDate: now
    });

    await UserSettings.create({
      userId: user.userId,
      displayName: `${firstName} ${lastName}`,
      email: user.email,
      theme: 'light',
      language: 'English',
      notificationsEnabled: true
    });

    sendSuccess(res, { userId: user.userId }, 201);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 409, 'CONFLICT', 'A user with this email already exists.');
    }
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const updateUser = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, 'VALIDATION_ERROR', 'User ID must be a valid number.', { param: 'id' });

  const { firstName, lastName, userRole } = req.body;

  const missing = ['firstName', 'lastName', 'userRole'].filter((f) => !req.body[f]);
  if (missing.length) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}.`, { fields: missing });
  }

  if (!VALID_ROLES.includes(userRole)) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Invalid userRole. Allowed values: ${VALID_ROLES.join(', ')}.`, { field: 'userRole', allowed: VALID_ROLES });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) return sendError(res, 404, 'NOT_FOUND', `User with ID ${id} not found.`);

    await user.update({ firstName, lastName, userRole, updateDate: new Date() });
    sendSuccess(res, { userId: user.userId });
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const deleteUser = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, 'VALIDATION_ERROR', 'User ID must be a valid number.', { param: 'id' });

  try {
    const user = await User.findByPk(id);
    if (!user) return sendError(res, 404, 'NOT_FOUND', `User with ID ${id} not found.`);

    const userId = user.userId;
    await user.destroy();
    sendSuccess(res, { userId });
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
