import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Draw = sequelize.define('Draw', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  ekub_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  cycle_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  draw_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'DRAFT',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  min_number: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  max_number: {
    type: DataTypes.INTEGER,
    defaultValue: 80,
  },
  lucky_spin_count: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
  },
  lucky_user_ids: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  current_spin: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_winners: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  started_at: {
    type: DataTypes.DATE,
  },
  completed_at: {
    type: DataTypes.DATE,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'draws',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Draw;