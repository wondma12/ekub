import { body, param, validationResult } from 'express-validator';

export const validateCreateDraw = [
  body('ekub_id').isInt().withMessage('Ekub ID must be an integer'),
  body('draw_number').isInt().withMessage('Draw number must be an integer'),
  body('lucky_spin_count').optional().isInt({ min: 0 }).withMessage('Lucky spin count must be 0 or greater'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

export const validateLuckyNumbers = [
  param('drawId').isInt().withMessage('Draw ID must be an integer'),
  body('luckyNumbers').isArray().withMessage('Lucky numbers must be an array'),
  body('luckyNumbers.*').isInt({ min: 1, max: 80 }).withMessage('Numbers must be between 1 and 80'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];