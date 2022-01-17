const { User } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

async function getUserById(id) {
  try {
    const user = await User.findById(id).exec();
    if (user !== null) return user;
  } catch (error) {
    console.log(error.message);
  }
}

async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ email }).exec();
    return user;
  } catch (error) {
    console.log(error.message);
  }
}

async function createUser(userBody) {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.OK, 'Email already taken');
  } else {
    const newUser = await User.create(userBody);
    return newUser;
  }
}

const getUserAddressById = async (id) => {
  try {
    return User.findOne({ _id: id }, { email: 1, address: 1 });
  } catch (error) {
    console.log(error);
  }
};

const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();

  return user.address;
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  getUserAddressById,
  setAddress,
};
