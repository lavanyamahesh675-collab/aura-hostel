const { validationResult } = require('express-validator');

/**
 * Express-validator result check middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed on submitted form payload',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRequest
};
