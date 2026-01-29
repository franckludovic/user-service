const authService = require('../services/auth.service');
const eventPublisher = require('../services/eventPublisher.service');

const register = async (req, res) => {
  try {
    const userData = req.body;
    const user = await authService.register(userData);

    // Publish user registered event
    await eventPublisher.publishEvent('user.registered', {
      userId: user.userId,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString()
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.message === 'User already exists') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(422).json({ error: error.message });
    }
  }
};

const verifyEmail = async (req, res) => {
  try {
    const result = await authService.verifyEmail(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const tokens = await authService.refreshToken(refresh_token);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    await authService.logout(token);
    res.status(204).send();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.status(200).json({ message: 'Password reset initiated' });
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
