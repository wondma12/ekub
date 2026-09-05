import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getEkubMembers,
  addEkubMember,
  removeEkubMember,
  getProfile,
  updateProfile as updateUserProfile,
  changePassword as changeUserPassword,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Profile routes (accessible by all authenticated users)
router.get('/profile', getProfile);
router.put('/profile', updateUserProfile);
router.post('/change-password', changeUserPassword);

// Admin only routes
router.use(roleMiddleware(['ADMIN']));

// User management
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/status', updateUserStatus);

// Ekub member management
router.get('/ekub/:ekubId/members', getEkubMembers);
router.post('/ekub/:ekubId/members', addEkubMember);
router.delete('/ekub/:ekubId/members/:userId', removeEkubMember);

export default router;