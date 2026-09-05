import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EkubMember = sequelize.define('EkubMember', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  ekub_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'ACTIVE',
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ekub_members',
  timestamps: true,
  createdAt: 'joined_at',
  updatedAt: false,
});

export default EkubMember;