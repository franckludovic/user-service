const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticate, userController.listUsers);
router.get('/:user_id', authenticate, userController.getUserProfile);
router.patch('/:user_id', authenticate, userController.updateUserProfile);
router.delete('/:user_id', authenticate, userController.deleteUser);
router.patch('/:user_id/role', authenticate, userController.updateUserRole);

module.exports = router;
