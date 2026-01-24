const Joi = require('joi');

// Register schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('client', 'worker', 'admin').optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Forgot password schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Reset password schema
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
