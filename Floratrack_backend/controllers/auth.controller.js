const { Op } = require('sequelize');
const { User } = require('../models');
const { sendSuccess, sendError } = require('../src/utils/response');
const { formatUser } = require('../src/utils/formatters');

const toSession = (user) => ({
  userId: user.userId,
  firstName: user.firstName,
  lastName: user.lastName,
  userRole: user.userRole,
  email: user.email
});

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

module.exports = { login, logout, getCurrentUser };
