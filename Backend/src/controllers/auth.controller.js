const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService } = require('../services');


const register = catchAsync(async (req, res, next) => {
  const body = req.body;
  const user = await userService.createUser(body);
  const tokens = await tokenService.generateAuthTokens(user);
  const data = {
    user,
    tokens,
  };
  await res.status(httpStatus.CREATED);
  await res.send(data);
});

const login = catchAsync(async (req, res, next) => {
  const body = req.body;
  const user = await authService.loginUserWithEmailAndPassword(
    body.email,
    body.password
  );

  if (user) {
    const tokens = await tokenService.generateAuthTokens(user);
    const data = {
      user,
      tokens,
    };
    await res.status(httpStatus.OK);
    await res.send(data);
  }
});

module.exports = {
  register,
  login,
};
