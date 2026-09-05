import bcrypt from 'bcrypt';
import config from '../config/config.js';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.bcryptRounds);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};