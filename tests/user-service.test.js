const prisma = require('../src/database/prismaClient');
const RedisCache = require('../src/utils/redisCache');
const userService = require('../src/services/user.service');

// Mock dependencies
jest.mock('../src/database/prismaClient');
jest.mock('../src/utils/redisCache');

const mockCache = new RedisCache();

describe('User Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Redis Caching Tests', () => {
    test('should return cached user on cache hit', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      mockCache.get.mockResolvedValue(JSON.stringify(mockUser));

      const result = await userService.getUserById('user1');

      expect(mockCache.get).toHaveBeenCalledWith('user:user1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('should fetch from database and cache on cache miss', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      mockCache.get.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user1');

      expect(mockCache.get).toHaveBeenCalledWith('user:user1');
      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith('user:user1', mockUser, 300);
      expect(result).toEqual(mockUser);
    });

    test('should handle cache invalidation on user update', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      prisma.user.update.mockResolvedValue({ ...mockUser, name: 'Jane Doe' });

      await userService.updateUser('user1', { name: 'Jane Doe' });

      expect(mockCache.del).toHaveBeenCalledWith('user:user1');
    });

    test('should handle cache invalidation on user deletion', async () => {
      prisma.user.delete.mockResolvedValue({ userId: 'user1' });

      await userService.deleteUser('user1');

      expect(mockCache.del).toHaveBeenCalledWith('user:user1');
    });

    test('should handle cache invalidation on role update', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      prisma.user.update.mockResolvedValue({ ...mockUser, role: 'worker' });

      await userService.updateUserRole('user1', 'worker');

      expect(mockCache.del).toHaveBeenCalledWith('user:user1');
    });

    test('should gracefully handle cache failures', async () => {
      mockCache.get.mockRejectedValue(new Error('Redis connection failed'));
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user1');

      expect(result).toEqual(mockUser);
    });

    test('should handle cache parsing errors gracefully', async () => {
      mockCache.get.mockResolvedValue('invalid json');
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user1');

      expect(result).toEqual(mockUser);
    });
  });

  describe('User CRUD Operations', () => {
    test('should list users with filters', async () => {
      const filters = { role: 'client', active: 'true', limit: 10, offset: 0 };
      const mockUsers = [
        { userId: 'user1', name: 'John Doe', role: 'client', active: true },
        { userId: 'user2', name: 'Jane Smith', role: 'client', active: true }
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(2);

      const result = await userService.listUsers(filters);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'client', active: true },
        take: 10,
        skip: 0,
      });
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
    });

    test('should get user by ID', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      mockCache.get.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user1');

      expect(result).toEqual(mockUser);
    });

    test('should throw error for non-existent user', async () => {
      mockCache.get.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getUserById('nonexistent')).rejects.toThrow('User not found');
    });

    test('should update user', async () => {
      const updateData = { name: 'Jane Doe', email: 'jane@example.com' };
      const mockUser = { userId: 'user1', name: 'Jane Doe', email: 'jane@example.com' };
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await userService.updateUser('user1', updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: updateData,
      });
      expect(result).toEqual(mockUser);
    });

    test('should delete user', async () => {
      prisma.user.delete.mockResolvedValue({ userId: 'user1' });

      await userService.deleteUser('user1');

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { userId: 'user1' } });
    });

    test('should update user role', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'worker' };
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await userService.updateUserRole('user1', 'worker');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: { role: 'worker' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection failures', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('Database connection failed'));

      await expect(userService.listUsers({})).rejects.toThrow('Database connection failed');
    });

    test('should handle cache set failures', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      mockCache.get.mockResolvedValue(null);
      mockCache.set.mockRejectedValue(new Error('Redis set failed'));
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Should not fail the operation
      const result = await userService.getUserById('user1');
      expect(result).toEqual(mockUser);
    });

    test('should handle cache delete failures', async () => {
      mockCache.del.mockRejectedValue(new Error('Redis delete failed'));
      prisma.user.update.mockResolvedValue({ userId: 'user1', name: 'Jane Doe' });

      // Should not fail the operation
      const result = await userService.updateUser('user1', { name: 'Jane Doe' });
      expect(result.name).toBe('Jane Doe');
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent user lookups', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      mockCache.get.mockResolvedValue(JSON.stringify(mockUser));

      const promises = Array(10).fill().map(() =>
        userService.getUserById('user1')
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toEqual(mockUser);
      });
    });

    test('should measure cache hit performance', async () => {
      const startTime = Date.now();
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      mockCache.get.mockResolvedValue(JSON.stringify(mockUser));

      await userService.getUserById('user1');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Should be very fast
    });

    test('should handle bulk user operations', async () => {
      const users = Array(100).fill().map((_, i) => ({
        userId: `user${i}`,
        name: `User ${i}`,
        role: 'client'
      }));

      prisma.user.findMany.mockResolvedValue(users);
      prisma.user.count.mockResolvedValue(100);

      const startTime = Date.now();
      const result = await userService.listUsers({ limit: 100 });
      const endTime = Date.now();

      expect(result.users).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Data Consistency Tests', () => {
    test('should maintain data consistency during concurrent updates', async () => {
      const updateData1 = { name: 'Jane Doe' };
      const updateData2 = { email: 'jane@example.com' };

      prisma.user.update
        .mockResolvedValueOnce({ userId: 'user1', name: 'Jane Doe' })
        .mockResolvedValueOnce({ userId: 'user1', email: 'jane@example.com' });

      const [result1, result2] = await Promise.all([
        userService.updateUser('user1', updateData1),
        userService.updateUser('user1', updateData2)
      ]);

      expect(result1.name).toBe('Jane Doe');
      expect(result2.email).toBe('jane@example.com');
    });

    test('should handle cache invalidation race conditions', async () => {
      mockCache.del.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)));
      prisma.user.update.mockResolvedValue({ userId: 'user1', name: 'Jane Doe' });

      const promises = Array(5).fill().map(() =>
        userService.updateUser('user1', { name: 'Jane Doe' })
      );

      await Promise.all(promises);

      // Cache should be invalidated multiple times
      expect(mockCache.del).toHaveBeenCalledTimes(5);
    });
  });

  describe('TTL and Expiration Tests', () => {
    test('should set appropriate TTL for cached users', async () => {
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      mockCache.get.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await userService.getUserById('user1');

      expect(mockCache.set).toHaveBeenCalledWith('user:user1', mockUser, 300); // 5 minutes
    });

    test('should handle TTL expiration simulation', async () => {
      // First call - cache miss
      mockCache.get.mockResolvedValueOnce(null);
      const mockUser = { userId: 'user1', name: 'John Doe', role: 'client' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await userService.getUserById('user1');

      // Second call - cache hit
      mockCache.get.mockResolvedValueOnce(JSON.stringify(mockUser));

      const result = await userService.getUserById('user1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1); // Only called once
    });
  });
});
