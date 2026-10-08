const express = require('express');
const authController = require('../controllers/auth.contoller');
const { validationRules } = require('../middlewares/validate.middleware');
const { authUser } = require('../middlewares/auth.middleware');

const route = express.Router();

route.post('/register', validationRules, authController.registerUser);
route.post('/loginuser', authController.loginUser);
route.post('/logout', authController.logoutUser);
route.get('/me', authUser, authController.getMe);

module.exports = route;