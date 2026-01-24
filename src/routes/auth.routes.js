const express = require('express');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth.validators');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.get('/register/verify', authController.verifyEmail);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/token/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/password/forgot', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/password/reset', validateRequest(resetPasswordSchema), authController.resetPassword);

module.exports = router;
