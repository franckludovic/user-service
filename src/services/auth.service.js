const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const prisma = require('../database/prismaClient');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/jwt');

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid password');

  // Update last login
  await prisma.user.update({
    where: { userId: user.userId },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 900, // 15 minutes
    refresh_token: refreshToken,
  };
};

const register = async (userData) => {
  const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      phone: userData.phone,
    },
  });

  // Send verification email (placeholder)
  // const verificationToken = crypto.randomBytes(32).toString('hex');
  // await sendEmail(user.email, 'Verify your email', `Token: ${verificationToken}`);

  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const verifyEmail = async (token) => {
  // Placeholder: verify token and activate user
  // For now, assume token is valid
  throw new Error('Email verification not implemented');
};

const refreshToken = async (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { userId: decoded.sub } });
    if (!user) throw new Error('User not found');

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    return {
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: newRefreshToken,
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const logout = async (token) => {
  throw new Error('Password reset not implemented');
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  // Generate reset token (placeholder)
  // const resetToken = crypto.randomBytes(32).toString('hex');
  // await sendEmail(user.email, 'Reset your password', `Token: ${resetToken}`);
};

const resetPassword = async (token, newPassword) => {
  throw new Error('Password reset not implemented');
};

module.exports = {
  login,
  register,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
