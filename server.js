require('dotenv').config();
const Hapi = require('@hapi/hapi');
const { createClient } = require('@supabase/supabase-js');
const routes = require('./routes');
const userRoutes = require('./routes/userRoutes');

// Fungsi validasi untuk strategi otentikasi Hapi
const validateSupabaseJwt = async (decoded, request, h) => {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return { isValid: false };
  }
  const token = authHeader.replace('Bearer ', '');

  try {
    // Verifikasi token menggunakan Supabase Auth
    // Inisialisasi client di sini untuk memastikan token dari header digunakan
    const { data: { user }, error } = await createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    }).auth.getUser();

    if (error || !user) {
      return { isValid: false };
    }

    // Jika valid, teruskan informasi user ke handler
    return {
      isValid: true,
      credentials: {
        id: user.id,
        email: user.email,
        nama: user.user_metadata.nama,
      },
    };
  } catch (err) {
    console.error('JWT validation error:', err);
    return { isValid: false };
  }
};

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3001,
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
    routes: {
      cors: {
        origin: ['*'], // Di produksi, lebih baik spesifik, misal: ['https://app-anda.com']
      },
    },
  });

  await server.register(require('@hapi/jwt'));

  // Konfigurasi strategi otentikasi 'supabase_jwt'
  server.auth.strategy('supabase_jwt', 'jwt', {
    keys: process.env.SUPABASE_JWT_SECRET,
    verify: {
      aud: false, // Jangan validasi audience di sini
      iss: false, // Jangan validasi issuer di sini
      sub: false, // Jangan validasi subject di sini
      exp: true   // TETAP validasi expiration time (penting!)
    },
    validate: validateSupabaseJwt, // Fungsi kustom kita akan validasi sisanya
  });

  // Jadikan 'supabase_jwt' sebagai strategi default
  server.auth.default('supabase_jwt');

  server.route([...routes, ...userRoutes]);

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Organify API with Supabase';
    },
    options: { auth: false } // Rute ini tidak memerlukan otentikasi
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();