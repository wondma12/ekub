import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cycle = sequelize.define('Cycle', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  ekub_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  cycle_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  contribution_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'UPCOMING',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'cycles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Cycle;