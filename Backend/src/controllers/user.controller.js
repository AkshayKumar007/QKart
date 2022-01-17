const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');


const getUser = catchAsync(async (req, res) => {
  if (req.query.q) {
    const user = await userService.getUserAddressById(req.params.userId);

    if (user) {
      if (req.user.email !== user.email) {
        throw new ApiError(httpStatus.FORBIDDEN);
      } else {
        const address = {
          address: user.address,
        };
        res.status(httpStatus.OK);
        res.send(address);
      }
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  } else {
    const id = req.params.userId;

    let user = await userService.getUserById(id);
    // console.log('getuser')
    // console.log(req.user._id === user._id);
    if (req.user.email !== user.email) {
      throw new ApiError(httpStatus.FORBIDDEN);
    }
    if (user) {
      res.status(200).send(user);
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  }
});

const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User not authorized to access this resource'
    );
  }

  const address = await userService.setAddress(user, req.body.address);

  res.send({
    address: address,
  });
});

module.exports = {
  getUser,
  setAddress,
};
