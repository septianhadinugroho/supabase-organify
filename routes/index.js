const Joi = require('joi');
const catatanController = require('../controllers/catatanController');
const kategoriController = require('../controllers/kategoriController');
const grafikController = require('../controllers/grafikController');

const authStrategy = 'supabase_jwt';

const routes = [
  // Catatan routes
  {
    method: 'POST',
    path: '/catatan',
    handler: catatanController.createCatatanHandler,
    options: {
      auth: authStrategy,
      validate: {
        payload: Joi.object({
          kategori: Joi.string().required(),
          nama_list: Joi.string().required(), // Diubah
          tanggal_deadline: Joi.string().isoDate().required(), // Diubah
          status: Joi.boolean().optional()
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/catatan',
    handler: catatanController.getCatatansHandler,
    options: { auth: authStrategy }
  },
  {
    method: 'GET',
    path: '/catatan/{id}',
    handler: catatanController.getCatatanByIdHandler,
    options: {
      auth: authStrategy,
      validate: { params: Joi.object({ id: Joi.string().required() }) }
    }
  },
  {
    method: 'PUT',
    path: '/catatan/{id}',
    handler: catatanController.updateCatatanHandler,
    options: {
      auth: authStrategy,
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
        payload: Joi.object({
          kategori: Joi.string().optional(),
          nama_list: Joi.string().optional(), // Diubah
          tanggal_deadline: Joi.string().isoDate().optional(), // Diubah
          status: Joi.boolean().optional()
        }).min(1)
      }
    }
  },
  {
    method: 'DELETE',
    path: '/catatan/{id}',
    handler: catatanController.deleteCatatanHandler,
    options: {
      auth: authStrategy,
      validate: { params: Joi.object({ id: Joi.string().required() }) }
    }
  },
  {
    method: 'GET',
    path: '/catatan/filter',
    handler: catatanController.getFilteredCatatansHandler,
    options: {
      auth: authStrategy,
      validate: {
        query: Joi.object({
          deadlineWithin7Days: Joi.string().valid('true', 'false').optional()
        })
      }
    }
  },
  {
    method: 'DELETE',
    path: '/catatan/hapusBeres',
    handler: catatanController.hapusCatatanBeresHandler,
    options: { auth: authStrategy }
  },
  
  // TodoItem routes
  {
    method: 'POST',
    path: '/catatan/{id}/todoItem',
    handler: catatanController.tambahTodoItemHandler,
    options: {
      auth: authStrategy,
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
        payload: Joi.object({
          judul: Joi.string().required(),
          isi: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'PUT',
    path: '/catatan/{id}/todoItem',
    handler: catatanController.updateTodoItemHandler,
    options: {
      auth: authStrategy,
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
        payload: Joi.object({
          judul: Joi.string().optional(),
          isi: Joi.string().optional()
        }).min(1)
      }
    }
  },
  {
    method: 'DELETE',
    path: '/catatan/{id}/todoItem',
    handler: catatanController.hapusTodoItemHandler,
    options: {
      auth: authStrategy,
      validate: { params: Joi.object({ id: Joi.string().required() }) }
    }
  },
  
  // Kategori routes
  {
    method: 'GET',
    path: "/kategori",
    handler: kategoriController.getKategoriHandler,
    options: { auth: authStrategy }
  },
  {
    method: 'POST',
    path: "/kategori",
    handler: kategoriController.createKategoriHandler,
    options: {
      auth: authStrategy,
      validate: {
        payload: Joi.object({
          kategori: Joi.string().required()
        })
      }
    }
  },
  
  // Grafik route
  {
    method: 'GET',
    path: '/grafik',
    handler: grafikController.getGrafikTugasSelesaiHandler,
    options: {
      auth: authStrategy,
      validate: {
        query: Joi.object({
          tanggalAwal: Joi.string()
            .pattern(/^\d{4}-\d{2}-\d{2}$/)
            .required()
            .description('Tanggal awal rentang 7 hari (format: YYYY-MM-DD)')
        })
      }
    }
  }
];

module.exports = routes;