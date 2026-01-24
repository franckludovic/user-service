const prisma = require('../database/prismaClient');

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
  const user = await prisma.user.findUnique({
    where: { userId },
  });
  if (!user) throw new Error('User not found');
  return user;
};

const updateUser = async (userId, userData) => {
  const user = await prisma.user.update({
    where: { userId },
    data: userData,
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
