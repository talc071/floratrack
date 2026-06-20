const express = require('express');
const loggerMiddleware = require('../middleware/logger.middleware');
const usersRoutes = require('../routes/users.routes');
const plantsRoutes = require('../routes/plants.routes');
const authRoutes = require('../routes/auth.routes');
const apiUsersRoutes = require('../routes/apiUsers.routes');
const settingsRoutes = require('../routes/settings.routes');
const careLogsRoutes = require('../routes/careLogs.routes');
const aiRoutes = require('../routes/ai.routes');

const createApp = () => {
  const app = express();

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-role, x-user-id');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use(express.json());
  app.use(loggerMiddleware);

  app.get('/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok', service: 'FloraTrack API' }, error: null });
  });

  app.use('/users', usersRoutes);
  app.use('/plants', plantsRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', apiUsersRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/care-logs', careLogsRoutes);
  app.use('/api/ai', aiRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} does not exist.`,
        details: {}
      }
    });
  });

  app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
        details: {}
      }
    });
  });

  return app;
};

module.exports = { createApp };
