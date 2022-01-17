const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByUser(req.user);
  res.send(cart);
});

const addProductToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addProductToCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );

  res.status(httpStatus.CREATED).send(cart);
});

const updateProductInCart = catchAsync(async (req, res) => {
  if (req.body.quantity > 0) {
    const cart = await cartService.updateProductInCart(
      req.user,
      req.body.productId,
      req.body.quantity
    );

    res.status(httpStatus.OK);
    res.send(cart);
  } else {
    const cart = await cartService.deleteProductFromCart(
      req.user,
      req.body.productId,
      req.body.quantity
    );
    res.status(httpStatus.NO_CONTENT);
    res.send(cart);
  }
});

const checkout = catchAsync(async (req, res) => {
  await cartService.checkout(req.user);
  res.status(httpStatus.NO_CONTENT);
  return res.send();
});

module.exports = {
  getCart,
  addProductToCart,
  updateProductInCart,
  checkout,
};
