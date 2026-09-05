import express from 'express';
import { createEkub, deleteEkub, getEkubs, updateEkub } from '../controllers/ekubController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { validateCreateEkub } from '../validators/ekubValidator.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['ADMIN', 'JUDGE']));
router.get('/', getEkubs);
router.post('/', validateCreateEkub, createEkub);
router.put('/:ekubId', validateCreateEkub, updateEkub);
router.delete('/:ekubId', deleteEkub);

export default router;