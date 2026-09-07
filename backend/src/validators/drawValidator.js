import { body, param, validationResult } from 'express-validator';

export const validateCreateDraw = [
  body('ekub_id').isInt().withMessage('Ekub ID must be an integer'),
  body('draw_numbers').isArray({ min: 1 }).withMessage('Enter at least one wheel number'),
  body('draw_numbers.*').isInt({ min: 1 }).withMessage('Wheel numbers must be positive integers'),
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
  body('luckyNumbers.*').isInt({ min: 1 }).withMessage('Lucky numbers must be positive integers'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];