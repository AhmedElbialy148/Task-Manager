const jwt = require('jsonwebtoken');
const User = require('../model/user');
const ObjectId = require('mongoose').Types.ObjectId;
module.exports = (req, res, next) => {
  const token = req.get('Authorization').split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, function (err, decodedToken) {
    if (err) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
    // return decodedToken;
    User.findOne({ _id: new ObjectId(decodedToken.userId) })
      .then(user => {
        if (!user) {
          return res.status(422).json({
            statusCode: 422,
            message: 'User Not Found!.. Please re-login.',
          });
        }
        req.user = user;
        req.userId = decodedToken.userId;
        next();
      })
      .catch(err => {
        res.status(500).json({
          statusCode: 500,
          message: 'Error 500: Server error occured',
        });
      });
  });
};
