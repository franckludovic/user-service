const prisma = require('../database/prismaClient');

const listUsers = async (filters) => {
  const { role, active, limit = 10, offset = 0 } = filters;
  const where = {};
  if (role) where.role = role;
  if (active !== undefined) where.active = active === 'true';

  const users = await prisma.user.findMany({
    where,
    include: {
      address: true,
      privacySettings: true,
    },
    take: limit,
    skip: offset,
  });

  const total = await prisma.user.count({ where });

  return { users, total };
};

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      address: true,
      privacySettings: true,
    },
  });
  if (!user) throw new Error('User not found');
  return user;
};

const updateUser = async (userId, userData) => {
  const { address, privacySettings, ...userFields } = userData;
  const user = await prisma.user.update({
    where: { userId },
    data: {
      ...userFields,
      address: address ? {
        upsert: {
          create: address,
          update: address,
        },
      } : undefined,
      privacySettings: privacySettings ? {
        upsert: {
          create: privacySettings,
          update: privacySettings,
        },
      } : undefined,
    },
    include: {
      address: true,
      privacySettings: true,
    },
  });
  return user;
};

const deleteUser = async (userId) => {
  await prisma.user.delete({ where: { userId } });
};

const updateUserRole = async (userId, role) => {
  const user = await prisma.user.update({
    where: { userId },
    data: { role },
    include: {
      address: true,
      privacySettings: true,
    },
  });
  return user;
};

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
};
