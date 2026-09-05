import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DrawNumber = sequelize.define('DrawNumber', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  draw_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ELIGIBLE', 'LUCKY', 'WON', 'EXCLUDED'),
    defaultValue: 'ELIGIBLE',
  },
  is_visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_lucky: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lucky_order: {
    type: DataTypes.INTEGER,
  },
  won_at: {
    type: DataTypes.DATE,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'draw_numbers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default DrawNumber;