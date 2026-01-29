const prisma = require('../database/prismaClient');
const redisClient = require('../config/redis');
const RedisCache = require('../utils/redisCache');

const cache = new RedisCache(redisClient, 600); // 10 minutes default TTL

const listUsers = async (filters) => {
  const { role, active, limit = 10, offset = 0 } = filters;
  const where = {};
  if (role) where.role = role;
  if (active !== undefined) where.active = active === 'true';

  const users = await prisma.user.findMany({
    where,
    take: limit,
    skip: offset,
  });

  const total = await prisma.user.count({ where });

  return { users, total };
};

const getUserById = async (userId) => {
  // Generate cache key for user profile
  const cacheKey = `user:${userId}`;

  // Try to get from cache first
  const cachedUser = await cache.get(cacheKey);
  if (cachedUser) {
    try {
      return JSON.parse(cachedUser);
    } catch (error) {
      console.error('Error parsing cached user:', error);
      // Continue to fetch from database if cache parsing fails
    }
  }

  // Cache miss - fetch from database
  const user = await prisma.user.findUnique({
    where: { userId },
  });
  if (!user) throw new Error('User not found');

  // Cache the user profile (TTL: 5 minutes for user data)
  try {
    await cache.set(cacheKey, user, 300);
  } catch (error) {
    console.error('Error caching user:', error);
    // Don't fail the request if caching fails
  }

  return user;
};

const updateUser = async (userId, userData) => {
  const user = await prisma.user.update({
    where: { userId },
    data: userData,
  });

  // Invalidate user cache
  try {
    await cache.del(`user:${userId}`);
  } catch (error) {
    console.error('Error clearing user cache after update:', error);
    // Don't fail the update if cache clearing fails
  }

  return user;
};

const deleteUser = async (userId) => {
  await prisma.user.delete({ where: { userId } });

  // Invalidate user cache
  try {
    await cache.del(`user:${userId}`);
  } catch (error) {
    console.error('Error clearing user cache after delete:', error);
    // Don't fail the delete if cache clearing fails
  }
};

const updateUserRole = async (userId, role) => {
  const user = await prisma.user.update({
    where: { userId },
    data: { role },
  });

  // Invalidate user cache
  try {
    await cache.del(`user:${userId}`);
  } catch (error) {
    console.error('Error clearing user cache after role update:', error);
    // Don't fail the role update if cache clearing fails
  }

  return user;
};

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
};
