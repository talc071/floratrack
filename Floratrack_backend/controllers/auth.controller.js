const { Op } = require('sequelize');
const { User, UserSettings } = require('../models');
const { sendSuccess, sendError } = require('../src/utils/response');
const { formatUser } = require('../src/utils/formatters');

const toSession = (user) => ({
  userId: user.userId,
  firstName: user.firstName,
  lastName: user.lastName,
  userRole: user.userRole,
  email: user.email
});

const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const missing = ['firstName', 'lastName', 'email', 'password'].filter((f) => !req.body[f]);
  if (missing.length) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}.`, { fields: missing });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Enter a valid email address.', { fields: ['email'] });
  }

  if (password.length < 6) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Password must be at least 6 characters.', { fields: ['password'] });
  }

  try {
    const existing = await User.findOne({ where: { email: { [Op.eq]: email } } });
    if (existing) {
      return sendError(res, 409, 'CONFLICT', 'An account with this email already exists.');
    }

    const now = new Date();
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      userRole: 'user',
      createDate: now,
      updateDate: now
    });

    await UserSettings.create({
      userId: user.userId,
      displayName: `${firstName} ${lastName}`,
      email,
      theme: 'light',
      language: 'English',
      notificationsEnabled: true
    });

    sendSuccess(res, toSession(formatUser(user)), 201);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 409, 'CONFLICT', 'An account with this email already exists.');
    }
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Email and password are required.', { fields: ['email', 'password'] });
  }

  try {
    const user = await User.findOne({
      where: { email: { [Op.eq]: email } }
    });

    if (!user || user.password !== password) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    sendSuccess(res, toSession(formatUser(user)));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const logout = (req, res) => {
  sendSuccess(res, { message: 'Logged out successfully.' });
};

const getCurrentUser = async (req, res) => {
  const userId = parseInt(req.headers['x-user-id'], 10);
  if (!userId) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User not found.');
    }
    sendSuccess(res, formatUser(user));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

module.exports = { register, login, logout, getCurrentUser };
