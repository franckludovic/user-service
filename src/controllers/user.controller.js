const userService = require('../services/user.service');

const listUsers = async (req, res) => {
  try {
    const { role, active, limit, offset } = req.query;
    const users = await userService.listUsers({ role, active, limit: parseInt(limit), offset: parseInt(offset) });
    res.json(users);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.user_id);
    // Check if user can access this profile
    if (req.user.userId !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    // Check if user can update this profile
    if (req.user.userId !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await userService.updateUser(req.params.user_id, req.body);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Only admins can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await userService.deleteUser(req.params.user_id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    // Only admins can update roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { role } = req.body;
    const user = await userService.updateUserRole(req.params.user_id, role);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  listUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  updateUserRole,
};
