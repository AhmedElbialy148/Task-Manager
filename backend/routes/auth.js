const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const authController = require('../controllers/auth');

router.get('/checkAuth', authController.getCheckAuth);

router.post(
  '/signup',
  body('email', 'Please enter a valid email.').isEmail(),
  body('password', 'Please enter a password with text and numbers only.')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters')
    .isAlphanumeric(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords have to match.');
    }
    return true;
  }),
  authController.postSignup
);

router.post(
  '/login',
  body('email', 'Please enter a valid email.').isEmail(),
  body('password', 'Please enter a password with text and numbers only.')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters')
    .isAlphanumeric(),
  authController.postLogin
);

router.post(
  '/email',
  body('email', 'Please enter a valid email.').isEmail(),
  authController.postSendResetEmail
);

router.post('/verifcode', authController.postvarificationCode);

router.post(
  '/newPassword',
  body('newPassword', 'Please enter a password with text and numbers only.')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters')
    .isAlphanumeric(),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords have to match.');
    }
    return true;
  }),
  authController.postNewPassword
);

module.exports = router;
