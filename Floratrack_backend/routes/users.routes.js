const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');
const plantsController = require('../controllers/plants.controller');
const { authorize } = require('../middleware/auth.middleware');

// GET  /users             – list all users (public)
router.get('/', usersController.getAllUsers);

// GET  /users/:id         – get one user (public)
router.get('/:id', usersController.getUserById);

// GET  /users/:userId/plants – get all plants owned by a user (public)
router.get('/:userId/plants', plantsController.getPlantsByUser);

// POST /users             – create user (admin, manager only)
router.post('/', authorize('admin', 'manager'), usersController.createUser);

// PUT  /users/:id         – update user (admin, manager only)
router.put('/:id', authorize('admin', 'manager'), usersController.updateUser);

// DELETE /users/:id       – delete user (admin only)
router.delete('/:id', authorize('admin'), usersController.deleteUser);

module.exports = router;
