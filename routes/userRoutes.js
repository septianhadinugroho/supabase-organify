const Joi = require('joi');
const userController = require('../controllers/userController');

module.exports = [
  {
    method: 'POST',
    path: '/signup',
    handler: userController.signupHandler,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          nama: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: userController.loginHandler,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/forgot-password',
    handler: userController.forgotPasswordHandler,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required()
        })
      }
    }
  },
  {
    method: 'DELETE',
    path: '/delete-account',
    handler: userController.deleteAccountHandler,
    options: {
      auth: 'supabase_jwt'
    }
  },
  {
    method: 'GET',
    path: '/me',
    handler: userController.getMeHandler,
    options: {
      auth: 'supabase_jwt'
    }
  }
];