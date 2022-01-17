const httpStatus = require('http-status');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');


const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (user) {
    if (await user.isPasswordMatch(password)) return user;
    else
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Incorrect email or password'
      );
  } else {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
};
