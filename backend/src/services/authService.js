import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import config from '../config/config.js';

class AuthService {
  async register(userData) {
    const { full_name, email, phone, password, role = 'USER' } = userData;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    const salt = await bcrypt.genSalt(config.bcryptRounds);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      full_name,
      email,
      phone,
      password_hash,
      role,
      status: 'ACTIVE',
    });

    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      user: userResponse,
      token,
    };
  }

  async login(email, password) {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active. Please contact support.');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    await user.update({ last_login: new Date() });

    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      user: userResponse,
      token,
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return { token };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(config.bcryptRounds);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await user.update({ password_hash });

    return { success: true };
  }

  async resetPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    return { success: true };
  }

  async resetPasswordWithToken(token, newPassword) {
    // Implementation for reset password with token
    return { success: true };
  }

  async verifyEmail(token) {
    // Implementation for email verification
    return { success: true };
  }
}

export default new AuthService();