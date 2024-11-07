const User = require('../model/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_AUTH_USER,
    pass: process.env.GMAIL_AUTH_PASSWORD,
  },
});

/////////////////////////////////////////////////////////
exports.getCheckAuth = async (req, res, next) => {
  const token = req.get('Authorization').split(' ')[1];
  const decodedToken = jwt.verify(
    token,
    process.env.JWT_SECRET,
    function (err, decoded) {
      if (err) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
        });
      }
      return res.status(202).json({
        statusCode: 202,
      });
    }
  );
};

exports.postSignup = async (req, res, next) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    // Check validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }
    // Check existing email
    const user = await User.findOne({ email: email });
    if (user) {
      throw new Error('Email already has an account.');
    }

    //   Create hashed Password
    const hashedPassword = await bcrypt.hash(password, 12);

    //   Create new user
    await User.insertMany([
      {
        email: email,
        password: hashedPassword,
      },
    ]);
    return res.status(200).json({
      statusCode: 200,
    });
  } catch (err) {
    res.status(422).json({
      statusCode: 422,
      message: err.message,
    });
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    // Check validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }
    // Check email
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error('Invalid E-mail');
    }

    // Check password
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      throw new Error('Wrong Password');
    }

    // Create a JWT
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '12hr' }
    );

    // Send the JWT
    return res.status(200).json({
      statusCode: 200,
      token: token,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
};

exports.postSendResetEmail = async (req, res, next) => {
  try {
    let email = req.body.email;

    //1) Check validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }
    // 2) Check email existance
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("This email doesn't have an account");
      error.statusCode = 422;
      throw error;
    }

    // 3) Create verification code
    let token;
    crypto.randomBytes(3, async (err, buffer) => {
      try {
        if (err) {
          throw new Error("Couldn't create a verification code");
        }
        token = buffer.toString('hex');

        // 4) Save token in user document in DB
        user.verifCode = token;
        await user.save();

        // 5) Send email with verification code
        let mailOptions = {
          from: process.env.GMAIL_AUTH_USER,
          to: email,
          subject: 'Verification Code',
          text: `Your verification Code is: ${token}`,
        };
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            throw new Error("Couldn't send an email. Please try again later.");
          } else {
            return res.status(200).json({
              statusCode: 200,
            });
          }
        });
      } catch (err) {
        throw err;
      }
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

exports.postvarificationCode = async (req, res, next) => {
  try {
    const verifCode = req.body.verifCode;
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('user not found in DB.');
      error.statusCode = 404;
      throw error;
    }
    if (user.verifCode !== verifCode) {
      const error = new Error('Wrong verification code!');
      error.statusCode = 422;
      throw error;
    }
    res.status(200).json({
      statusCode: 200,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const verifCode = req.body.verifCode;
    const newPassword = req.body.newPassword;

    // 1) Check validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    // 2) fetch user from DB
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('User not found in DB.');
      error.statusCode = 404;
      throw error;
    }
    if (user.verifCode !== verifCode) {
      const error = new Error('Wrong verification code!');
      error.statusCode = 422;
      throw error;
    }

    // 3) create hashed password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    // 4) Update user password and remove verifode
    user.password = hashedPassword;
    user.verifCode = '';
    await user.save();

    return res.status(200).json({
      statusCode: 200,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};
