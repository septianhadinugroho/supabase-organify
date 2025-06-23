const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.signupHandler = async (request, h) => {
  const { nama, email, password } = request.payload;

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { nama: nama }
    }
  });

  if (error) {
    return h.response({ status: 'error', message: error.message }).code(error.status || 400);
  }

  return h.response({
    status: 'success',
    message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
    data: data.user
  }).code(201);
};

exports.loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return h.response({ status: 'fail', message: error.message }).code(error.status || 401);
  }

  return h.response({
    status: 'success',
    message: 'Login berhasil',
    token: data.session.access_token,
    user: {
        id: data.user.id,
        nama: data.user.user_metadata.nama,
        email: data.user.email
    }
  });
};

exports.forgotPasswordHandler = async (request, h) => {
  const { email } = request.payload;
  // Supabase akan menggunakan URL redirect yang dikonfigurasi di dashboard Auth
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return h.response({ status: 'error', message: error.message }).code(400);
  }
  return h.response({ message: 'Link reset password telah dikirim ke email Anda.' });
};

exports.deleteAccountHandler = async (request, h) => {
  const userId = request.auth.credentials.id;

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return h.response({ status: 'error', message: `Gagal menghapus akun: ${error.message}` }).code(500);
  }

  return h.response({ status: 'success', message: 'Akun berhasil dihapus.' });
};

exports.getMeHandler = async (request, h) => {
  const { id, email, nama } = request.auth.credentials;
  return h.response({ status: 'success', data: { id, email, nama } }).code(200);
};