const { Product } = require("../models");

const getProductById = async (id) => {
  return Product.findById(id);
};

const getProducts = async () => {
  return Product.find({});
};

module.exports = {
  getProductById,
  getProducts,
};
