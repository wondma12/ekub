import sequelize from '../config/database.js';
import User from './User.js';
import Ekub from './Ekub.js';
import EkubMember from './EkubMember.js';
import Cycle from './Cycle.js';
import Payment from './Payment.js';
import Draw from './Draw.js';
import DrawNumber from './DrawNumber.js';
import DrawResult from './DrawResult.js';
import Notification from './Notification.js';
import AuditLog from './AuditLog.js';

// User - Ekub associations
User.hasMany(Ekub, { foreignKey: 'created_by', as: 'createdEkubs' });
Ekub.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User - EkubMember associations
User.hasMany(EkubMember, { foreignKey: 'user_id', as: 'ekubMemberships' });
EkubMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Ekub.hasMany(EkubMember, { foreignKey: 'ekub_id', as: 'members' });
EkubMember.belongsTo(Ekub, { foreignKey: 'ekub_id', as: 'ekub' });

// User - Draw associations
User.hasMany(Draw, { foreignKey: 'created_by', as: 'createdDraws' });
Draw.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Ekub - Cycle associations
Ekub.hasMany(Cycle, { foreignKey: 'ekub_id', as: 'cycles' });
Cycle.belongsTo(Ekub, { foreignKey: 'ekub_id', as: 'ekub' });

// Ekub - Draw associations
Ekub.hasMany(Draw, { foreignKey: 'ekub_id', as: 'draws' });
Draw.belongsTo(Ekub, { foreignKey: 'ekub_id', as: 'ekub' });

// Draw - DrawNumber associations
Draw.hasMany(DrawNumber, { foreignKey: 'draw_id', as: 'numbers' });
DrawNumber.belongsTo(Draw, { foreignKey: 'draw_id', as: 'draw' });

// Draw - DrawResult associations
Draw.hasMany(DrawResult, { foreignKey: 'draw_id', as: 'results' });
DrawResult.belongsTo(Draw, { foreignKey: 'draw_id', as: 'draw' });

// DrawNumber - DrawResult associations
DrawNumber.hasMany(DrawResult, { foreignKey: 'draw_number_id', as: 'results' });
DrawResult.belongsTo(DrawNumber, { foreignKey: 'draw_number_id', as: 'drawNumber' });
User.hasMany(DrawResult, { foreignKey: 'user_id', as: 'drawResults' });
DrawResult.belongsTo(User, { foreignKey: 'user_id', as: 'winner' });

// User - Notification associations
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cycle - Payment associations
Cycle.hasMany(Payment, { foreignKey: 'cycle_id', as: 'payments' });
Payment.belongsTo(Cycle, { foreignKey: 'cycle_id', as: 'cycle' });

// User - Payment associations
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  User,
  Ekub,
  EkubMember,
  Cycle,
  Payment,
  Draw,
  DrawNumber,
  DrawResult,
  Notification,
  AuditLog,
};