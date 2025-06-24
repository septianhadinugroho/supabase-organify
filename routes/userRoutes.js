const Joi = require('joi');
const userController = require('../controllers/userController');

module.exports = [
  {
    method: 'POST',
    path: '/signup',
    handler: userController.signupHandler,
    options: {
      auth: false,
      tags: ['api', 'user'],
      description: 'Mendaftarkan pengguna baru',
      notes: 'Membuat akun pengguna baru dan mengirimkan email verifikasi.',
      validate: {
        payload: Joi.object({
          nama: Joi.string().required().example('John Doe'),
          email: Joi.string().email().required().example('john.doe@example.com'),
          password: Joi.string().min(6).required().example('password123')
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
      tags: ['api', 'user'],
      description: 'Login pengguna',
      notes: 'Mengotentikasi pengguna dan mengembalikan token JWT jika berhasil.',
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required().example('john.doe@example.com'),
          password: Joi.string().required().example('password123')
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
      tags: ['api', 'user'],
      description: 'Lupa password',
      notes: 'Mengirim email berisi link untuk mereset password ke alamat email yang terdaftar.',
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required().example('john.doe@example.com')
        })
      }
    }
  },
  {
    method: 'DELETE',
    path: '/delete-account',
    handler: userController.deleteAccountHandler,
    options: {
      auth: 'supabase_jwt',
      tags: ['api', 'user'],
      description: 'Menghapus akun pengguna',
      notes: 'Menghapus akun pengguna yang sedang login secara permanen. Operasi ini tidak dapat diurungkan.'
    }
  },
  {
    method: 'GET',
    path: '/me',
    handler: userController.getMeHandler,
    options: {
      auth: 'supabase_jwt',
      tags: ['api', 'user'],
      description: 'Mendapatkan detail pengguna saat ini',
      notes: 'Mengembalikan informasi dasar dari pengguna yang terotentikasi (ID, nama, email).'
    }
  }
];