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

const getKategoriHandler = async (request, h) => {
  // GUNAKAN CLIENT YANG TEROTENTIKASI
  const supabase = createSupabaseClient(request);
  
  const { data: counts, error: rpcError } = await supabase.rpc('get_kategori_counts');
  if (rpcError) {
    return h.response({ status: 'error', message: `Gagal mengambil kategori: ${rpcError.message}` }).code(500);
  }

  const { data: allKategoris, error: kError } = await supabase.from('kategori').select('nama');
  if (kError) {
    return h.response({ status: 'error', message: `Gagal mengambil kategori: ${kError.message}` }).code(500);
  }

  const kategoriMap = new Map();
  if (allKategoris) {
    allKategoris.forEach(k => kategoriMap.set(k.nama, { kategori: k.nama, jumlahCatatan: 0 }));
  }
  if (counts) {
    counts.forEach(c => kategoriMap.set(c.kategori, c));
  }

  return h.response({ status: 'success', data: Array.from(kategoriMap.values()) }).code(200);
};

const createKategoriHandler = async (request, h) => {
  // GUNAKAN CLIENT YANG TEROTENTIKASI
  const supabase = createSupabaseClient(request);
  const { kategori } = request.payload;
  const userId = request.auth.credentials.id;

  const { data, error } = await supabase
    .from('kategori')
    .insert([{ nama: kategori, user_id: userId }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
       return h.response({ status: 'fail', message: 'Kategori sudah ada' }).code(409);
    }
    return h.response({ status: 'error', message: `Gagal membuat kategori: ${error.message}` }).code(500);
  }

  return h.response({ status: 'success', message: 'Kategori berhasil ditambahkan', data }).code(201);
};

module.exports = { getKategoriHandler, createKategoriHandler };