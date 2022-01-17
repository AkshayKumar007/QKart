const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');

const router = express.Router();

router
  .route('/register')
  .post(validate(authValidation.register), (req, res, next) => {
    authController.register(req, res, next);
  });

router.route('/login').post(validate(authValidation.login), (req, res, next) => {
  authController.login(req, res, next);
});

module.exports = router;
