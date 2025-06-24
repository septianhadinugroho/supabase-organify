const Joi = require('joi');
const catatanController = require('../controllers/catatanController');
const kategoriController = require('../controllers/kategoriController');
const grafikController = require('../controllers/grafikController');

const authStrategy = 'supabase_jwt';

const routes = [
  // --- Catatan routes ---
  {
    method: 'POST',
    path: '/catatan',
    handler: catatanController.createCatatanHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'catatan'],
      description: 'Membuat catatan baru',
      notes: 'Membuat catatan baru untuk pengguna yang login. Jika kategori belum ada, akan dibuat otomatis.',
      validate: {
        payload: Joi.object({
          kategori: Joi.string().required().example('Pekerjaan'),
          nama_list: Joi.string().required().example('Selesaikan Laporan Proyek'),
          tanggal_deadline: Joi.string().isoDate().required().example('2025-12-31T17:00:00.000Z'),
          status: Joi.boolean().optional().default(false)
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/catatan',
    handler: catatanController.getCatatansHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'catatan'],
      description: 'Mendapatkan semua catatan',
      notes: 'Mengambil semua catatan milik pengguna yang sedang login.'
    }
  },
  {
    method: 'GET',
    path: '/catatan/{id}',
    handler: catatanController.getCatatanByIdHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'catatan'],
      description: 'Mendapatkan detail satu catatan',
      notes: 'Mengambil detail sebuah catatan berdasarkan ID uniknya.',
      validate: { params: Joi.object({ id: Joi.string().required().description('ID unik dari catatan') }) }
    }
  },
  {
    method: 'PUT',
    path: '/catatan/{id}',
    handler: catatanController.updateCatatanHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'catatan'],
      description: 'Memperbarui sebuah catatan',
      notes: 'Memperbarui satu atau lebih field dari sebuah catatan yang sudah ada.',
      validate: {
        params: Joi.object({ id: Joi.string().required().description('ID unik dari catatan') }),
        payload: Joi.object({
          kategori: Joi.string().optional().example('Pribadi'),
          nama_list: Joi.string().optional().example('Belanja bulanan'),
          tanggal_deadline: Joi.string().isoDate().optional().example('2025-07-15T10:00:00.000Z'),
          status: Joi.boolean().optional().example(true)
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
      tags: ['api', 'catatan'],
      description: 'Menghapus sebuah catatan',
      notes: 'Menghapus sebuah catatan berdasarkan ID uniknya.',
      validate: { params: Joi.object({ id: Joi.string().required().description('ID unik dari catatan') }) }
    }
  },
  {
    method: 'GET',
    path: '/catatan/filter',
    handler: catatanController.getFilteredCatatansHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'catatan'],
      description: 'Filter catatan yang belum selesai',
      notes: 'Mendapatkan catatan yang belum selesai dengan filter tambahan, seperti deadline dalam 7 hari.',
      validate: {
        query: Joi.object({
          deadlineWithin7Days: Joi.string().valid('true', 'false').optional().description("Set ke 'true' untuk filter deadline dalam 7 hari")
        })
      }
    }
  },
  {
    method: 'DELETE',
    path: '/catatan/hapusBeres',
    handler: catatanController.hapusCatatanBeresHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'catatan'],
      description: 'Menghapus semua catatan yang selesai',
      notes: 'Menghapus semua catatan milik pengguna yang statusnya sudah selesai (true).'
    }
  },

  // --- TodoItem routes ---
  {
    method: 'POST',
    path: '/catatan/{id}/todoItem',
    handler: catatanController.tambahTodoItemHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'todo-item'],
      description: 'Menambahkan Todo Item ke catatan',
      notes: 'Menambahkan atau mengganti objek todo_item pada sebuah catatan.',
      validate: {
        params: Joi.object({ id: Joi.string().required().description('ID unik dari catatan induk') }),
        payload: Joi.object({
          judul: Joi.string().required().example('Detail Laporan'),
          isi: Joi.string().required().example('Kumpulkan data penjualan Q2.')
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
      tags: ['api', 'todo-item'],
      description: 'Memperbarui Todo Item',
      notes: 'Memperbarui judul atau isi dari todo_item yang sudah ada.',
      validate: {
        params: Joi.object({ id: Joi.string().required().description('ID unik dari catatan induk') }),
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
      tags: ['api', 'todo-item'],
      description: 'Menghapus Todo Item',
      notes: 'Menghapus todo_item dari sebuah catatan (mengatur nilainya menjadi null).',
      validate: { params: Joi.object({ id: Joi.string().required().description('ID unik dari catatan induk') }) }
    }
  },

  // --- Kategori routes ---
  {
    method: 'GET',
    path: "/kategori",
    handler: kategoriController.getKategoriHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'kategori'],
      description: 'Mendapatkan daftar kategori',
      notes: 'Mengambil semua kategori unik milik pengguna beserta jumlah catatan di dalamnya.'
    }
  },
  {
    method: 'POST',
    path: "/kategori",
    handler: kategoriController.createKategoriHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'kategori'],
      description: 'Membuat kategori baru',
      notes: 'Membuat kategori baru. Nama kategori untuk satu pengguna harus unik.',
      validate: {
        payload: Joi.object({
          kategori: Joi.string().required().example('Belajar')
        })
      }
    }
  },

  // --- Grafik route ---
  {
    method: 'GET',
    path: '/grafik',
    handler: grafikController.getGrafikTugasSelesaiHandler,
    options: {
      auth: authStrategy,
      tags: ['api', 'grafik'],
      description: 'Data untuk grafik tugas selesai',
      notes: 'Mendapatkan data jumlah tugas yang selesai per hari untuk rentang 7 hari.',
      validate: {
        query: Joi.object({
          tanggalAwal: Joi.string()
            .pattern(/^\d{4}-\d{2}-\d{2}$/)
            .required()
            .description('Tanggal awal rentang 7 hari (format: YYYY-MM-DD)').example('2025-06-18')
        })
      }
    }
  }
];

module.exports = routes;