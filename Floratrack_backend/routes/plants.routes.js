const express = require('express');
const router = express.Router();

const plantsController = require('../controllers/plants.controller');
const { authorize } = require('../middleware/auth.middleware');

// GET  /plants             – list all plants, supports ?userId=&healthStatus=&location= (public)
router.get('/', plantsController.getAllPlants);

// GET  /plants/:id/history  – get plant with care log history (public)
router.get('/:id/history', plantsController.getPlantHistory);

// GET  /plants/:id         – get one plant (public)
router.get('/:id', plantsController.getPlantById);

// POST /plants             – create plant (any authenticated role)
router.post('/', authorize('admin', 'manager', 'user'), plantsController.createPlant);

// PUT  /plants/:id         – update plant (admin, manager only)
router.put('/:id', authorize('admin', 'manager'), plantsController.updatePlant);

// DELETE /plants/:id       – delete plant (admin only)
router.delete('/:id', authorize('admin'), plantsController.deletePlant);

module.exports = router;
