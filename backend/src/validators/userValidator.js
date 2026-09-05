import { body, param, query, validationResult } from 'express-validator';

// Validation rules for getting users with pagination and filters
export const validateGetUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .trim()
    .escape(),

  query('role')
    .optional()
    .isIn(['ADMIN', 'JUDGE', 'USER']).withMessage('Invalid role specified'),

  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']).withMessage('Invalid status specified'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for getting user by ID
export const validateGetUserById = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be an integer')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for creating user (admin)
export const validateCreateUser = [
  body('full_name')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Full name must be between 2 and 150 characters')
    .trim()
    .escape(),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email must not exceed 150 characters'),

  body('phone')
    .optional()
    .isLength({ min: 10, max: 30 }).withMessage('Phone number must be between 10 and 30 characters')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Phone number contains invalid characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),

  body('role')
    .optional()
    .isIn(['ADMIN', 'JUDGE', 'USER']).withMessage('Invalid role specified'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']).withMessage('Invalid status specified'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for updating user
export const validateUpdateUser = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be an integer')
    .toInt(),

  body('full_name')
    .optional()
    .isLength({ min: 2, max: 150 }).withMessage('Full name must be between 2 and 150 characters')
    .trim()
    .escape(),

  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email must not exceed 150 characters'),

  body('phone')
    .optional()
    .isLength({ min: 10, max: 30 }).withMessage('Phone number must be between 10 and 30 characters')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Phone number contains invalid characters'),

  body('role')
    .optional()
    .isIn(['ADMIN', 'JUDGE', 'USER']).withMessage('Invalid role specified'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for updating user status
export const validateUpdateUserStatus = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be an integer')
    .toInt(),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']).withMessage('Invalid status specified'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for deleting user
export const validateDeleteUser = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be an integer')
    .toInt()
    .custom((value, { req }) => {
      // Prevent users from deleting themselves
      if (req.user && req.user.id === value) {
        throw new Error('You cannot delete your own account');
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for getting ekub members
export const validateGetEkubMembers = [
  param('ekubId')
    .notEmpty().withMessage('Ekub ID is required')
    .isInt().withMessage('Ekub ID must be an integer')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for adding ekub member
export const validateAddEkubMember = [
  param('ekubId')
    .notEmpty().withMessage('Ekub ID is required')
    .isInt().withMessage('Ekub ID must be an integer')
    .toInt(),

  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be an integer')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for removing ekub member
export const validateRemoveEkubMember = [
  param('ekubId')
    .notEmpty().withMessage('Ekub ID is required')
    .isInt().withMessage('Ekub ID must be an integer')
    .toInt(),

  param('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be an integer')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for user profile update
export const validateUserProfileUpdate = [
  body('full_name')
    .optional()
    .isLength({ min: 2, max: 150 }).withMessage('Full name must be between 2 and 150 characters')
    .trim()
    .escape(),

  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email must not exceed 150 characters'),

  body('phone')
    .optional()
    .isLength({ min: 10, max: 30 }).withMessage('Phone number must be between 10 and 30 characters')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Phone number contains invalid characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

// Validation rules for user change password
export const validateUserChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('New password must contain at least one letter and one number'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];