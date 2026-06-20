const express = require('express');
const router = express.Router();
const careLogsController = require('../controllers/careLogs.controller');
const { authorize } = require('../middleware/auth.middleware');

router.post('/', authorize('admin', 'manager', 'user'), careLogsController.logCareAction);

module.exports = router;
