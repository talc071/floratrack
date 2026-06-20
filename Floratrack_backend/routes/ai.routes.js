const express = require('express');
const multer = require('multer');
const aiController = require('../controllers/ai.controller');
const { authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/identify', authorize('admin', 'manager', 'user'), upload.single('image'), aiController.identifyPlant);

module.exports = router;
