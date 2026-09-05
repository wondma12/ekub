import { sequelize, Draw, DrawNumber, DrawResult, User, Ekub } from '../models/index.js';
import { Op } from 'sequelize';

class DrawService {
  /**
   * Create a new draw with one slot per active user.
   */
  async createDraw(data) {
    const transaction = await sequelize.transaction();

    try {
      const ekub = await Ekub.findByPk(data.ekub_id, { transaction });
      if (!ekub) {
        throw new Error(`Ekub ${data.ekub_id} was not found. Create an Ekub before creating a draw.`);
      }

      const participantCount = await User.count({
        where: { role: 'USER', status: 'ACTIVE' },
        transaction,
      });
      if (participantCount === 0) {
        throw new Error('At least one active registered user is required before creating a draw');
      }

      const draw = await Draw.create({
        ekub_id: data.ekub_id,
        cycle_id: data.cycle_id,
        draw_number: data.draw_number,
        title: data.title || `Draw #${data.draw_number}`,
        min_number: 1,
        max_number: participantCount,
        lucky_spin_count: Math.min(data.lucky_spin_count || 7, participantCount),
        created_by: data.created_by,
        status: 'DRAFT',
      }, { transaction });

      // Generate one wheel slot per active participant.
      const numbers = [];
      for (let i = 1; i <= participantCount; i++) {
        numbers.push({
          draw_id: draw.id,
          number: i,
          status: 'ELIGIBLE',
          is_visible: true,
          is_lucky: false,
        });
      }

      await DrawNumber.bulkCreate(numbers, { transaction });

      await transaction.commit();
      return draw;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Set lucky numbers for a draw (admin selected)
   */
  async setLuckyNumbers(drawId, luckyUserIds, userId) {
    const transaction = await sequelize.transaction();

    try {
      const draw = await Draw.findByPk(drawId, { transaction });
      if (!draw) throw new Error('Draw not found');
      if (draw.status !== 'DRAFT') throw new Error('Draw is not in draft status');

      const normalizedIds = luckyUserIds.map(id => Number(id));
      if (!Array.isArray(luckyUserIds) || normalizedIds.length === 0) {
        throw new Error('Select at least one lucky user');
      }
      if (normalizedIds.length > 7) {
        throw new Error('Select no more than 7 lucky users');
      }
      if (new Set(normalizedIds).size !== normalizedIds.length) {
        throw new Error('Lucky users must be unique');
      }
      if (normalizedIds.some(id => !Number.isInteger(id) || id < 1)) {
        throw new Error('Lucky user IDs must be valid registered user IDs');
      }

      const luckyUsers = await User.findAll({
        where: { id: normalizedIds, role: 'USER', status: 'ACTIVE' },
        attributes: ['id'],
        transaction,
      });
      if (luckyUsers.length !== normalizedIds.length) {
        throw new Error('Every lucky user must be an active registered user');
      }

      await DrawNumber.update(
        { is_lucky: false, lucky_order: null, status: 'ELIGIBLE' },
        { where: { draw_id: drawId, is_lucky: true }, transaction }
      );

      const drawNumbers = await DrawNumber.findAll({
        where: { draw_id: drawId },
        order: [['number', 'ASC']],
        transaction,
      });

      for (let index = 0; index < normalizedIds.length; index += 1) {
        const drawNumber = drawNumbers[index];
        if (!drawNumber) break;

        await DrawNumber.update(
          {
            is_lucky: true,
            lucky_order: index + 1,
            status: 'LUCKY',
          },
          { where: { id: drawNumber.id }, transaction }
        );
      }

      draw.lucky_user_ids = normalizedIds;
      draw.lucky_spin_count = normalizedIds.length;
      draw.status = 'READY';
      await draw.save({ transaction });

      await transaction.commit();
      return draw;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Start the draw - spin the wheel
   */
  async startDraw(drawId) {
    const transaction = await sequelize.transaction();

    try {
      const draw = await Draw.findByPk(drawId);
      if (!draw) throw new Error('Draw not found');
      if (draw.status !== 'READY') throw new Error('Draw is not ready to start');

      const participantCount = await User.count({
        where: { role: 'USER', status: 'ACTIVE' },
        transaction,
      });
      const existingResults = await DrawResult.count({
        where: { draw_id: drawId },
        transaction,
      });
      if (existingResults === 0) {
        await DrawNumber.destroy({
          where: { draw_id: drawId, number: { [Op.gt]: participantCount } },
          transaction,
        });
        draw.max_number = participantCount;
      }

      draw.status = 'IN_PROGRESS';
      draw.started_at = new Date();
      await draw.save({ transaction });

      // Reset all numbers to eligible
      await DrawNumber.update(
        { status: 'ELIGIBLE' },
        { where: { draw_id: drawId }, transaction }
      );

      // Keep lucky numbers as lucky
      await DrawNumber.update(
        { status: 'LUCKY' },
        { where: { draw_id: drawId, is_lucky: true }, transaction }
      );

      await transaction.commit();
      return draw;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Spin the wheel - get next winner
   */
  async spin(drawId) {
    const transaction = await sequelize.transaction();

    try {
      const draw = await Draw.findByPk(drawId);
      if (!draw) throw new Error('Draw not found');
      if (draw.status !== 'IN_PROGRESS') throw new Error('Draw is not in progress');

      const participants = await User.findAll({
        where: { role: 'USER', status: 'ACTIVE' },
        attributes: ['id', 'full_name', 'email'],
        order: [['id', 'ASC']],
        transaction,
      });
      const previousResults = await DrawResult.findAll({
        where: { draw_id: drawId },
        attributes: ['user_id', 'selection_type'],
        transaction,
      });
      const previousUserIds = new Set(previousResults.map(result => String(result.user_id)).filter(Boolean));
      const remainingParticipants = participants.filter(user => !previousUserIds.has(String(user.id)));

      if (remainingParticipants.length === 0) {
        // All done
        draw.status = 'COMPLETED';
        draw.completed_at = new Date();
        await draw.save({ transaction });
        await transaction.commit();
        return { completed: true };
      }

      let selectedNumber;
      let selectedUser;

      const luckyUserIds = Array.isArray(draw.lucky_user_ids) ? draw.lucky_user_ids : [];
      const pendingLuckyUserId = luckyUserIds
        .map(id => String(id))
        .find(id => !previousUserIds.has(id));

      if (pendingLuckyUserId) {
        selectedUser = remainingParticipants.find(
          user => String(user.id) === pendingLuckyUserId
        );
        selectedNumber = await DrawNumber.findOne({
          where: {
            draw_id: drawId,
            status: 'LUCKY',
            is_lucky: true,
          },
          order: [['lucky_order', 'ASC']],
          transaction,
        });

        if (!selectedUser || !selectedNumber) {
          throw new Error('A configured lucky user or lucky number is unavailable');
        }
      } else {
        // Lucky users are exhausted; only then choose from the remaining users randomly.
        selectedNumber = await DrawNumber.findOne({
          where: {
            draw_id: drawId,
            status: 'ELIGIBLE',
          },
          order: sequelize.random(),
          transaction,
        });
        selectedUser = remainingParticipants[Math.floor(Math.random() * remainingParticipants.length)];
      }

      if (!selectedNumber) {
        throw new Error('No eligible numbers found');
      }

      // Mark as winner
      selectedNumber.status = 'WON';
      selectedNumber.won_at = new Date();
      await selectedNumber.save({ transaction });

      // Create result
      const result = await DrawResult.create({
        draw_id: drawId,
        draw_number_id: selectedNumber.id,
        user_id: selectedUser.id,
        number: selectedNumber.number,
        position: draw.current_spin + 1,
        selection_type: selectedNumber.is_lucky ? 'LUCKY' : 'RANDOM',
        spin_number: draw.current_spin + 1,
      }, { transaction });

      // Update draw
      draw.current_spin += 1;
      draw.total_winners += 1;
      await draw.save({ transaction });

      await transaction.commit();

      return {
        number: selectedNumber.number,
        user: selectedUser,
        isLucky: selectedNumber.is_lucky,
        spinNumber: draw.current_spin,
        totalSpins: participants.length,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async resetDraw(drawId) {
    const transaction = await sequelize.transaction();

    try {
      const draw = await Draw.findByPk(drawId, { transaction });
      if (!draw) throw new Error('Draw not found');

      await DrawResult.destroy({ where: { draw_id: drawId }, transaction });
      await DrawNumber.update(
        {
          status: 'ELIGIBLE',
          is_lucky: false,
          lucky_order: null,
          won_at: null,
        },
        { where: { draw_id: drawId }, transaction }
      );

      draw.status = 'DRAFT';
      draw.current_spin = 0;
      draw.total_winners = 0;
      draw.started_at = null;
      draw.completed_at = null;
      draw.lucky_spin_count = 7;
      draw.lucky_user_ids = [];
      await draw.save({ transaction });

      await transaction.commit();
      return draw;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get draw status and results
   */
  async getDrawStatus(drawId) {
    const draw = await Draw.findByPk(drawId, {
      include: [
        {
          model: DrawResult,
          as: 'results',
          attributes: ['number', 'position', 'selection_type', 'spin_number', 'user_id'],
          include: [{
            model: User,
            as: 'winner',
            attributes: ['id', 'full_name', 'email'],
          }],
          order: [['position', 'ASC']],
        },
        {
          model: DrawNumber,
          as: 'numbers',
          attributes: ['number', 'status', 'is_lucky', 'lucky_order'],
        },
      ],
    });

    if (!draw) throw new Error('Draw not found');

    const luckyNumbers = draw.numbers
      .filter(n => n.is_lucky)
      .sort((a, b) => a.lucky_order - b.lucky_order)
      .map(n => n.number);

    const winners = draw.results.map(r => ({
      number: r.number,
      user_id: r.user_id,
      user: r.winner,
      position: r.position,
      type: r.selection_type,
      spin: r.spin_number,
    }));

    const remaining = draw.numbers
      .filter(n => n.status === 'ELIGIBLE')
      .map(n => n.number);

    return {
      draw,
      luckyNumbers,
      luckyUserIds: Array.isArray(draw.lucky_user_ids) ? draw.lucky_user_ids : [],
      winners,
      remaining,
      totalNumbers: draw.numbers.length,
      totalUsers: await User.count({ where: { role: 'USER', status: 'ACTIVE' } }),
      totalWinners: draw.total_winners,
      isComplete: draw.status === 'COMPLETED',
      isInProgress: draw.status === 'IN_PROGRESS',
    };
  }

  /**
   * Get all draws for an ekub
   */
  async getDrawsByEkub(ekubId) {
    return await Draw.findAll({
      where: { ekub_id: ekubId },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });
  }

  async getAvailableUsers(drawId) {
    const draw = await Draw.findByPk(drawId);
    if (!draw) throw new Error('Draw not found');

    return await User.findAll({
      where: { role: 'USER', status: 'ACTIVE' },
      attributes: ['id', 'full_name', 'email'],
      order: [['id', 'ASC']],
    });
  }

  async updateDraw(drawId, data) {
    const draw = await Draw.findByPk(drawId);
    if (!draw) throw new Error('Draw not found');
    if (!['DRAFT', 'READY'].includes(draw.status)) {
      throw new Error('Only draft or ready draws can be edited');
    }

    await draw.update({
      ...(data.title !== undefined && { title: data.title?.trim() || `Draw #${draw.draw_number}` }),
      ...(data.draw_number !== undefined && { draw_number: data.draw_number }),
      ...(data.lucky_spin_count !== undefined && { lucky_spin_count: data.lucky_spin_count }),
      ...(data.ekub_id !== undefined && { ekub_id: data.ekub_id }),
    });
    return draw;
  }

  async deleteDraw(drawId) {
    const transaction = await sequelize.transaction();
    try {
      const draw = await Draw.findByPk(drawId, { transaction });
      if (!draw) throw new Error('Draw not found');
      await DrawResult.destroy({ where: { draw_id: drawId }, transaction });
      await DrawNumber.destroy({ where: { draw_id: drawId }, transaction });
      await draw.destroy({ transaction });
      await transaction.commit();
      return { id: drawId };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAllDraws() {
    return await Draw.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });
  }
}

export default new DrawService();