require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const userRoutes = require('./routes/userRoutes');

const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Pkg = require('./package.json');

const validateSupabaseJwt = async (decoded, request, h) => {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return { isValid: false };
  }
  const token = authHeader.replace('Bearer ', '');

  try {
    const { createClient } = require('@supabase/supabase-js');
    const { data: { user }, error } = await createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    }).auth.getUser();

    if (error || !user) {
      return { isValid: false };
    }

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
        origin: ['*'],
      },
    },
  });

  const swaggerOptions = {
    info: {
      title: 'Organify API Documentation',
      version: Pkg.version,
      description: 'Selamat datang di Organify API! Ini adalah backend service yang dibangun menggunakan Hapi.js dan terintegrasi dengan Supabase untuk menyediakan fungsionalitas aplikasi to-do list.'
    },
    host: `localhost:${process.env.PORT || 3001}`,
    securityDefinitions: {
      'supabase_jwt': {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: "Masukkan token JWT dengan format 'Bearer {token}'"
      }
    },
    security: [{ 'supabase_jwt': [] }]
  };

  await server.register([
    Inert,
    Vision,
    require('@hapi/jwt'),
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);

  server.auth.strategy('supabase_jwt', 'jwt', {
    keys: process.env.SUPABASE_JWT_SECRET,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      exp: true
    },
    validate: validateSupabaseJwt,
  });

  server.auth.default('supabase_jwt');

  server.route({
    method: 'GET',
    path: '/swaggerui/{param*}',
    handler: {
      directory: {
        path: require('path').join(__dirname, 'node_modules/swagger-ui-dist'),
      },
    },
    options: {
      auth: false,
    },
  });

  server.route([...routes, ...userRoutes]);

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Organify API with Supabase';
    },
    options: { auth: false }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
  console.log('API documentation available at: %s/documentation', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();