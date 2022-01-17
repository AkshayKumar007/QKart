const httpStatus = require('http-status');
const { Cart, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');


const getCartByUser = async (user) => {
  const cart = await Cart.findOne({ email: user.email }).exec();
  if (cart) {
    return cart;
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have a cart');
  }
};

const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email }).exec();
  const product = await Product.findById(productId).exec();

  if (!cart) {
    try {
      cart = await Cart.create({
        email: user.email,
        cartItems: [],
        paymentOption: config.default_payment_option,
      });
      if (!cart) throw 'Error';
    } catch (error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error'
      );
    }
  }

  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }

  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }

  if (productIndex !== -1) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Product already in cart. Use the cart sidebar to update or remove product from cart'
    );
  }

  cart.cartItems.push({ product, quantity });
  await cart.save();

  return cart;
};

const updateProductInCart = async (user, productId, quantity) => {
  const cart = await Cart.findOne({ email: user.email });
  const product = await Product.findById(productId).exec();

  if (!cart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User does not have a cart. Use POST to create cart and add a product'
    );
  }

  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }

  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }

  if (productIndex === -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not in cart');
  } else {
    cart.cartItems[productIndex].quantity = quantity;
  }

  await cart.save();

  return cart;
};

const deleteProductFromCart = async (user, productId) => {
  const cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not have a cart');
  }

  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }

  if (productIndex === -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not in cart');
  } else {
    cart.cartItems.splice(productIndex, 1);
  }

  await cart.save();

  return cart;
};

const checkout = async (user) => {
  let cart = await Cart.findOne({ email: user.email }).exec();

  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have a cart');
  } else {
    if (cart.cartItems.length <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No items in cart');
    }
    if (!(await user.hasSetNonDefaultAddress())) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User Address not set');
    }
    // here
    const total = cart.cartItems.reduce(
      (prev, item) => item.product.cost * item.quantity + prev,
      0
    );

    if (total > user.walletMoney) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient Balance');
    } else {
      user.walletMoney = user.walletMoney - total;
      cart.cartItems = [];
      await cart.save();
      await user.save();
      return cart;
    }
  }
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};

// await Cart.findOne({
//   _id: cart._id,
//   'cartItems.product._id': productId,
// }).exec()

// let totalAmount = 0;
// for (let i = 0; i < cart.cartItems.length; i++) {
//   let amount =
//     cart.cartItems[i]['product']['price'] * cart.cartItems[i]['quatity'];
//   totalAmount = totalAmount + amount;
// }
