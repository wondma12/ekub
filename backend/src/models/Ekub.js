import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Ekub = sequelize.define('Ekub', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  contribution_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'ACTIVE',
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ekubs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Ekub;