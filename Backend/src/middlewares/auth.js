const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');


const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (!user || err || info ) {
     reject(
      new ApiError(httpStatus.UNAUTHORIZED, 'Please  authenticate')
    );
  }else {
    req.user = user;
    resolve();
  }
 
};

const auth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',
      { session: false },
      verifyCallback(req, resolve, reject)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
