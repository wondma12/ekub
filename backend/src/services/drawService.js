import { sequelize, Draw, DrawNumber, DrawResult, User, Ekub } from '../models/index.js';
import { Op } from 'sequelize';

class DrawService {
  /**
   * Create a new draw with one wheel slot per configured draw number.
   */
  async createDraw(data) {
    const transaction = await sequelize.transaction();

    try {
      const ekub = await Ekub.findByPk(data.ekub_id, { transaction });
      if (!ekub) {
        throw new Error(`Ekub ${data.ekub_id} was not found. Create an Ekub before creating a draw.`);
      }

      const numberCount = Number(data.draw_number);
      if (!Number.isInteger(numberCount) || numberCount < 1) {
        throw new Error('Draw number must be a positive integer');
      }

      const draw = await Draw.create({
        ekub_id: data.ekub_id,
        cycle_id: data.cycle_id,
        draw_number: data.draw_number,
        title: data.title || `Draw #${data.draw_number}`,
        min_number: 1,
        max_number: numberCount,
        lucky_spin_count: Math.min(data.lucky_spin_count || 7, numberCount),
        created_by: data.created_by,
        status: 'DRAFT',
      }, { transaction });

      // Generate one wheel slot per configured number.
      const numbers = [];
      for (let i = 1; i <= numberCount; i++) {
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
  async setLuckyNumbers(drawId, luckyNumbers) {
    const transaction = await sequelize.transaction();

    try {
      const draw = await Draw.findByPk(drawId, { transaction });
      if (!draw) throw new Error('Draw not found');
      if (draw.status !== 'DRAFT') throw new Error('Draw is not in draft status');

      const normalizedNumbers = Array.isArray(luckyNumbers)
        ? luckyNumbers.map(number => Number(number))
        : [];
      if (normalizedNumbers.length === 0) {
        throw new Error('Select at least one lucky number');
      }
      if (normalizedNumbers.length > 7) {
        throw new Error('Select no more than 7 lucky numbers');
      }
      if (new Set(normalizedNumbers).size !== normalizedNumbers.length) {
        throw new Error('Lucky numbers must be unique');
      }
      if (normalizedNumbers.some(number => !Number.isInteger(number) || number < 1 || number > draw.max_number)) {
        throw new Error('Lucky numbers must be valid wheel numbers');
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

      for (let index = 0; index < normalizedNumbers.length; index += 1) {
        const drawNumber = drawNumbers.find(number => number.number === normalizedNumbers[index]);
        if (!drawNumber) throw new Error('Every lucky number must exist on the wheel');
        await DrawNumber.update(
          {
            is_lucky: true,
            lucky_order: index + 1,
            status: 'LUCKY',
          },
          { where: { id: drawNumber.id }, transaction }
        );
      }

      draw.lucky_user_ids = normalizedNumbers;
      draw.lucky_spin_count = normalizedNumbers.length;
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
      if (!draw.is_active) throw new Error('Draw is deactivated');
      if (draw.status !== 'READY') throw new Error('Draw is not ready to start');

      const existingResults = await DrawResult.count({
        where: { draw_id: drawId },
        transaction,
      });
      if (existingResults === 0) {
        draw.max_number = draw.draw_number;
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
      if (!draw.is_active) throw new Error('Draw is deactivated');
      if (draw.status !== 'IN_PROGRESS') throw new Error('Draw is not in progress');

      const previousResults = await DrawResult.findAll({
        where: { draw_id: drawId },
        attributes: ['draw_number_id', 'selection_type'],
        transaction,
      });
      const previousNumberIds = new Set(previousResults.map(result => String(result.draw_number_id)));

      const remainingNumbers = await DrawNumber.findAll({
        where: { draw_id: drawId, status: { [Op.in]: ['ELIGIBLE', 'LUCKY'] } },
        transaction,
      });
      if (remainingNumbers.length === 0) {
        // All done
        draw.status = 'COMPLETED';
        draw.completed_at = new Date();
        await draw.save({ transaction });
        await transaction.commit();
        return { completed: true };
      }

      let selectedNumber;
      const luckyUserIds = Array.isArray(draw.lucky_user_ids) ? draw.lucky_user_ids : [];
      const pendingLuckyNumber = luckyUserIds.find(number => {
        const candidate = remainingNumbers.find(item => item.number === Number(number));
        return candidate && !previousNumberIds.has(String(candidate.id));
      });

      if (pendingLuckyNumber) {
        selectedNumber = await DrawNumber.findOne({
          where: {
            draw_id: drawId,
            number: Number(pendingLuckyNumber),
            status: 'LUCKY',
            is_lucky: true,
          },
          order: [['lucky_order', 'ASC']],
          transaction,
        });

        if (!selectedNumber) {
          throw new Error('A configured lucky number is unavailable');
        }
      } else {
        // Lucky numbers are exhausted; choose from the remaining wheel numbers randomly.
        selectedNumber = await DrawNumber.findOne({
          where: {
            draw_id: drawId,
            status: 'ELIGIBLE',
          },
          order: sequelize.random(),
          transaction,
        });
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
        user_id: null,
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
        user: null,
        isLucky: selectedNumber.is_lucky,
        spinNumber: draw.current_spin,
        totalSpins: draw.max_number,
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

  async setDrawActive(drawId, isActive) {
    const draw = await Draw.findByPk(drawId);
    if (!draw) throw new Error('Draw not found');

    draw.is_active = Boolean(isActive);
    await draw.save();
    return draw;
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