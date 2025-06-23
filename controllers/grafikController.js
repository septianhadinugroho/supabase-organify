const { createClient } = require('@supabase/supabase-js');

// Fungsi pembantu untuk membuat client yang terotentikasi
const createSupabaseClient = (request) => {
  const token = request.headers.authorization;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: token }
    }
  });
};

const getGrafikTugasSelesaiHandler = async (request, h) => {
  // GUNAKAN CLIENT YANG TEROTENTIKASI
  const supabase = createSupabaseClient(request);
  const { tanggalAwal } = request.query;

  const { data, error } = await supabase.rpc('get_grafik_tugas_selesai', {
    tanggal_awal: tanggalAwal,
  });
  
  if (error) {
    return h.response({ status: 'error', message: `Gagal mengambil data grafik: ${error.message}` }).code(500);
  }
  
  return h.response({ status: 'success', data }).code(200);
};

module.exports = { getGrafikTugasSelesaiHandler };