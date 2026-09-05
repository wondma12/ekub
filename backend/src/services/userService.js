import { User, Ekub, EkubMember, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import config from '../config/config.js';

class UserService {
  async getUsers({ page = 1, limit = 10, search, role, status }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(userData) {
    const { password, ...rest } = userData;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: rest.email }, { phone: rest.phone }],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    const salt = await bcrypt.genSalt(config.bcryptRounds);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      ...rest,
      password_hash,
    });

    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return userResponse;
  }

  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    delete updateData.password;
    delete updateData.password_hash;

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return userResponse;
  }

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    await user.destroy();
    return { success: true };
  }

  async updateUserStatus(id, status) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ status });
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return userResponse;
  }

  async getEkubMembers(ekubId) {
    const members = await EkubMember.findAll({
      where: { ekub_id: ekubId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password_hash'] },
        },
      ],
    });

    return members;
  }

  async addEkubMember(ekubId, userId) {
    const [ekub, user] = await Promise.all([
      Ekub.findByPk(ekubId),
      User.findByPk(userId),
    ]);

    if (!ekub) {
      throw new Error('Ekub not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    const [member, created] = await EkubMember.findOrCreate({
      where: { ekub_id: ekubId, user_id: userId },
      defaults: { status: 'ACTIVE' },
    });

    if (!created) {
      throw new Error('User is already a member of this ekub');
    }

    return member;
  }

  async removeEkubMember(ekubId, userId) {
    const deleted = await EkubMember.destroy({
      where: { ekub_id: ekubId, user_id: userId },
    });

    if (deleted === 0) {
      throw new Error('Member not found in this ekub');
    }

    return { success: true };
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

  async getUsersByEkub(ekubId) {
    const members = await EkubMember.findAll({
      where: { ekub_id: ekubId, status: 'ACTIVE' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password_hash'] },
        },
      ],
      order: [['joined_at', 'ASC']],
    });

    return members.map(member => member.user);
  }
}

export default new UserService();