const { User, UserSettings } = require('../models');
const { sendSuccess, sendError } = require('../src/utils/response');

const getUserId = (req) => {
  const userId = parseInt(req.headers['x-user-id'], 10);
  return Number.isNaN(userId) ? null : userId;
};

const getSettings = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');

  try {
    let settings = await UserSettings.findByPk(userId);
    if (!settings) {
      const user = await User.findByPk(userId);
      if (!user) return sendError(res, 404, 'NOT_FOUND', 'User not found.');

      settings = await UserSettings.create({
        userId,
        displayName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        theme: 'light',
        language: 'English',
        notificationsEnabled: true
      });
    }

    sendSuccess(res, settings.get({ plain: true }));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

const updateSettings = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');

  const { displayName, email, theme, language, notificationsEnabled } = req.body;
  const missing = ['displayName', 'email', 'theme'].filter((f) => req.body[f] === undefined || req.body[f] === '');
  if (missing.length) {
    return sendError(res, 400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}.`, { fields: missing });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) return sendError(res, 404, 'NOT_FOUND', 'User not found.');

    let settings = await UserSettings.findByPk(userId);
    const payload = {
      displayName,
      email,
      theme,
      language: language || 'English',
      notificationsEnabled: !!notificationsEnabled
    };

    if (settings) {
      await settings.update(payload);
    } else {
      settings = await UserSettings.create({ userId, ...payload });
    }

    sendSuccess(res, settings.get({ plain: true }));
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

module.exports = { getSettings, updateSettings };
