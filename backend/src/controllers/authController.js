import authService from '../services/authService.js';
import { User } from '../models/index.js';
import { Op } from 'sequelize';

export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    
    // Check if user is admin or judge - only admins can create these roles
    if (role && (role === 'ADMIN' || role === 'JUDGE')) {
      if (req.user && req.user.role !== 'ADMIN') {
        return res.status(403).json({ 
          success: false, 
          error: 'Only admins can create admin or judge accounts' 
        });
      }
    }

    const result = await authService.register({
      full_name,
      email,
      phone,
      password,
      role: role || 'USER',
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
      });
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    await authService.resetPassword(email);

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required',
      });
    }

    await authService.resetPasswordWithToken(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }

    await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email } = req.body;
    const userId = req.user.id;

    if (email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: userId } },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken',
        });
      }
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    await user.update({
      full_name: full_name || user.full_name,
      phone: phone || user.phone,
      email: email || user.email,
    });

    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.json({
      success: true,
      data: { user: userResponse },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        isAuthenticated: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          full_name: req.user.full_name,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }
};

export const adminCreateUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, status } = req.body;

    if (role && (role === 'ADMIN' || role === 'JUDGE')) {
      return res.status(403).json({
        success: false,
        error: 'Only existing admins can create admin or judge accounts',
      });
    }

    const result = await authService.register({
      full_name,
      email,
      phone,
      password,
      role: role || 'USER',
    });

    if (status && status !== 'ACTIVE') {
      const user = await User.findByPk(result.user.id);
      await user.update({ status });
    }

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};