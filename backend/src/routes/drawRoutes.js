import express from 'express';
import {
  createDraw,
  setLuckyNumbers,
  startDraw,
  spin,
  getDrawStatus,
  getDrawsByEkub,
  getAllDraws,
  getDrawById,
  cancelDraw,
  getDrawResults,
  resetDraw,
  getAvailableUsers,
  updateDraw,
  deleteDraw,
} from '../controllers/drawController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public read-only routes support the public home page and draw viewer.
router.get('/', getAllDraws);
router.get('/:drawId/status', getDrawStatus);
router.get('/:drawId/results', getDrawResults);
router.get('/:drawId', getDrawById);
router.get('/ekub/:ekubId', getDrawsByEkub);

// The public draw page can start and run a configured draw.
router.post('/:drawId/start', startDraw);
router.post('/:drawId/spin', spin);

// Draw changes and user-specific data require authentication.
router.use(authMiddleware);

// Admin/Judge only routes
router.use(roleMiddleware(['ADMIN', 'JUDGE']));

// Draw management
router.post('/', createDraw);
router.put('/:drawId/lucky-numbers', setLuckyNumbers);
router.post('/:drawId/cancel', cancelDraw);
router.post('/:drawId/reset', resetDraw);
router.get('/:drawId/available-users', getAvailableUsers);
router.put('/:drawId', updateDraw);
router.delete('/:drawId', deleteDraw);

export default router;