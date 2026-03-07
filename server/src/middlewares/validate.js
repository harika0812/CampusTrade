import { body, validationResult, query } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const normalizedErrors = errors.array().map((err) => ({
      field: err.path || err.param || "unknown",
      message: err.msg
    }));

    return res.status(400).json({
      message: 'Validation failed',
      errors: normalizedErrors,
      details: normalizedErrors.map((item) => `${item.field}: ${item.message}`).join('; ')
    });
  }
  next();
};

// Sanitize function
export const sanitize = (str) => {
  if (!str) return str;
  return DOMPurify.sanitize(str).trim();
};

// AUTH VALIDATION RULES
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Name must be 2-120 characters')
    .matches(/^[A-Za-z][A-Za-z\s.'-]*$/).withMessage('Name can contain letters, spaces, apostrophe, dot, and hyphen'),
  
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .matches(/@gnits\.ac\.in$/).withMessage('Use your college email ending with @gnits.ac.in'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .matches(/@gnits\.ac\.in$/).withMessage('Only GNITS emails allowed'),

  handleValidationErrors
];

export const validateResetPassword = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),

  handleValidationErrors
];

// PRODUCT VALIDATION RULES
export const validateProduct = [
  body('title')
    .trim()
    .notEmpty().withMessage('Product title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0, max: 999999 }).withMessage('Price must be a valid number between 0 and 999999'),

  body('availableCopies')
    .optional()
    .isInt({ min: 0, max: 9999 }).withMessage('Available copies must be an integer between 0 and 9999'),

  body('listingType')
    .optional()
    .isIn(['sell', 'lend', 'both']).withMessage('listingType must be sell, lend, or both'),

  body('paymentOption')
    .optional()
    .isIn(['cod']).withMessage('Only COD is supported on this platform'),

  body('borrowFee')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 999999 }).withMessage('borrowFee must be a number between 0 and 999999'),

  body('maxDurationDays')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('maxDurationDays must be an integer between 1 and 365'),

  body('lendingTerms')
    .optional()
    .isLength({ max: 500 }).withMessage('lendingTerms can be at most 500 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ min: 2, max: 30 }).withMessage('Category must be 2-30 characters')
    .matches(/^[A-Za-z][A-Za-z0-9-]*$/).withMessage('Category must be one word (letters, numbers, hyphen)'),
  
  handleValidationErrors
];

// CHAT VALIDATION RULES
export const validateMessage = [
  body('senderId')
    .trim()
    .notEmpty().withMessage('Sender ID is required')
    .isMongoId().withMessage('Invalid sender ID'),
  
  body('receiverId')
    .trim()
    .notEmpty().withMessage('Receiver ID is required')
    .isMongoId().withMessage('Invalid receiver ID'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ min: 1, max: 10000 }).withMessage('Message must be 1-10000 characters'),
  
  handleValidationErrors
];

// QUERY VALIDATION RULES
export const validateUserIdQuery = [
  query('userId')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  
  handleValidationErrors
];

export const validateUserIdsQuery = [
  query('userId')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  
  query('otherUserId')
    .trim()
    .notEmpty().withMessage('Other user ID is required')
    .isMongoId().withMessage('Invalid other user ID'),
  
  handleValidationErrors
];

export const validateUserIdsBody = [
  body('userId')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),

  body('otherUserId')
    .trim()
    .notEmpty().withMessage('Other user ID is required')
    .isMongoId().withMessage('Invalid other user ID'),

  handleValidationErrors
];

// Middleware to sanitize all inputs
export const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitize(req.query[key]);
      }
    });
  }
  
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitize(req.params[key]);
      }
    });
  }
  
  next();
};

// Prevent NoSQL injection and XSS
export const securityMiddleware = [
  sanitizeInputs
];
