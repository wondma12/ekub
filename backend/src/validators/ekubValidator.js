import { body, validationResult } from 'express-validator';

export const validateCreateEkub = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Ekub name is required')
    .isLength({ max: 150 })
    .withMessage('Ekub name must be 150 characters or fewer'),
  body('description')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Description must be text'),
  body('contribution_amount')
    .isFloat({ min: 0 })
    .withMessage('Contribution amount must be 0 or greater'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];