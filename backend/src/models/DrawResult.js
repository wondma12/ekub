import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DrawResult = sequelize.define('DrawResult', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  draw_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  draw_number_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  selection_type: {
    type: DataTypes.ENUM('LUCKY', 'RANDOM'),
    allowNull: false,
  },
  spin_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  selected_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'draw_results',
  timestamps: true,
  createdAt: 'selected_at',
  updatedAt: false,
});

export default DrawResult;