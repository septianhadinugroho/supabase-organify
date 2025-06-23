const { createClient } = require('@supabase/supabase-js');

const createSupabaseClient = (request) => {
  const token = request.headers.authorization;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: token }
    }
  });
};

const createCatatanHandler = async (request, h) => {
  const supabase = createSupabaseClient(request);
  const { kategori, nama_list, tanggal_deadline, status } = request.payload;
  const userId = request.auth.credentials.id;

  // LANGKAH BARU: Otomatis buat kategori jika belum ada.
  // Perintah .upsert() akan mencoba memasukkan kategori baru.
  // Jika kategori dengan nama dan user_id yang sama sudah ada,
  // perintah ini akan diabaikan tanpa menyebabkan error.
  await supabase
      .from('kategori')
      .upsert({ nama: kategori, user_id: userId }, { onConflict: 'nama, user_id' });


  // Lanjutkan dengan membuat catatan seperti biasa
  const { data, error } = await supabase
    .from('catatan')
    .insert([{
      kategori,
      nama_list,
      tanggal_deadline: new Date(tanggal_deadline).toISOString(),
      status: status || false,
      user_id: userId
    }])
    .select('id')
    .single();

  if (error) {
    return h.response({ status: 'error', message: `Gagal menambah catatan: ${error.message}` }).code(500);
  }

  return h.response({ status: 'success', message: 'Catatan berhasil ditambahkan', data: { id: data.id } }).code(201);
};

const getCatatansHandler = async (request, h) => {
  const supabase = createSupabaseClient(request);
  const { data, error } = await supabase.from('catatan').select('*');

  if (error) {
    return h.response({ status: 'error', message: `Gagal mengambil catatan: ${error.message}` }).code(500);
  }
  return h.response({ status: 'success', data }).code(200);
};

const getCatatanByIdHandler = async (request, h) => {
  const supabase = createSupabaseClient(request);
  const { id } = request.params;
  const { data, error } = await supabase.from('catatan').select('*').eq('id', id).single();

  if (error || !data) {
    return h.response({ status: 'fail', message: 'Catatan tidak ditemukan' }).code(404);
  }
  return h.response({ status: 'success', data }).code(200);
};

const updateCatatanHandler = async (request, h) => {
    const supabase = createSupabaseClient(request);
    const { id } = request.params;
    const { kategori, nama_list, tanggal_deadline, status } = request.payload; // Diubah

    const updatedData = {};
    if (kategori) updatedData.kategori = kategori;
    if (nama_list) updatedData.nama_list = nama_list; // Diubah
    if (tanggal_deadline) updatedData.tanggal_deadline = tanggal_deadline; // Diubah
    if (typeof status !== 'undefined') updatedData.status = status;

    const { data, error } = await supabase.from('catatan').update(updatedData).eq('id', id).select();

    if (error) {
        return h.response({ status: 'error', message: `Gagal memperbarui catatan: ${error.message}` }).code(500);
    }
    if (!data || data.length === 0) {
        return h.response({ status: 'fail', message: 'Gagal memperbarui. Catatan tidak ditemukan.' }).code(404);
    }
    return h.response({ status: 'success', message: 'Catatan berhasil diperbarui' }).code(200);
};

const deleteCatatanHandler = async (request, h) => {
    const supabase = createSupabaseClient(request);
    const { id } = request.params;
    const { error, count } = await supabase.from('catatan').delete({ count: 'exact' }).eq('id', id);

    if (error || count === 0) {
        return h.response({ status: 'fail', message: 'Gagal menghapus. Catatan tidak ditemukan.' }).code(404);
    }
    return h.response({ status: 'success', message: 'Catatan berhasil dihapus' }).code(200);
};

const getFilteredCatatansHandler = async (request, h) => {
    const supabase = createSupabaseClient(request);
    const { deadlineWithin7Days } = request.query;
    let query = supabase.from('catatan').select('*').eq('status', false);

    if (deadlineWithin7Days === 'true') {
        const today = new Date();
        const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        query = query.gte('tanggal_deadline', today.toISOString()).lte('tanggal_deadline', sevenDaysLater.toISOString()); // Diubah
    }

    const { data, error } = await query;

    if (error) {
        return h.response({ status: 'error', message: `Gagal filter catatan: ${error.message}` }).code(500);
    }
    return h.response({ status: 'success', data }).code(200);
};

const hapusCatatanBeresHandler = async (request, h) => {
    const supabase = createSupabaseClient(request);
    const { error, count } = await supabase.from('catatan').delete().eq('status', true);
    if (error) {
        return h.response({ status: 'error', message: `Gagal menghapus catatan: ${error.message}` }).code(500);
    }
    return h.response({ status: 'success', message: `Berhasil menghapus ${count || 0} catatan.` }).code(200);
};

const tambahTodoItemHandler = async (request, h) => {
    const supabase = createSupabaseClient(request);
    const { id } = request.params;
    const { judul, isi } = request.payload;

    const todoItemBaru = { judul, isi, terakhirDiperbarui: new Date().toISOString() };
    const { data, error } = await supabase.from('catatan').update({ todo_item: todoItemBaru }).eq('id', id).select('todo_item').single(); // Diubah

    if (error || !data) {
        return h.response({ status: 'fail', message: 'Catatan tidak ditemukan' }).code(404);
    }
    return h.response({ status: 'success', message: 'Todo item berhasil ditambahkan', data: data.todo_item }).code(201);
};

const updateTodoItemHandler = async (request, h) => {
    const supabase = createSupabaseClient(request);
    const { id } = request.params;
    const { judul, isi } = request.payload;

    const { data: current, error: fetchError } = await supabase.from('catatan').select('todo_item').eq('id', id).single(); // Diubah
    if (fetchError || !current) return h.response({ status: 'fail', message: 'Catatan tidak ditemukan' }).code(404);
    if (!current.todo_item) return h.response({ status: 'fail', message: 'Catatan tidak memiliki todo item' }).code(404);

    const updatedTodo = {
        ...current.todo_item,
        judul: judul || current.todo_item.judul,
        isi: isi || current.todo_item.isi,
        terakhirDiperbarui: new Date().toISOString()
    };
    const { data, error } = await supabase.from('catatan').update({ todo_item: updatedTodo }).eq('id', id).select('todo_item').single(); // Diubah

    if (error) return h.response({ status: 'error', message: `Gagal memperbarui todo: ${error.message}` }).code(500);
    return h.response({ status: 'success', message: 'Todo item berhasil diperbarui', data: data.todo_item }).code(200);
};

const hapusTodoItemHandler = async (request, h) => {
    const supabase = createSupabaseClient(request);
    const { id } = request.params;
    const { error } = await supabase.from('catatan').update({ todo_item: null }).eq('id', id); // Diubah

    if (error) return h.response({ status: 'error', message: `Gagal menghapus todo item: ${error.message}` }).code(500);
    return h.response({ status: 'success', message: 'Todo item berhasil dihapus' }).code(200);
};

module.exports = { createCatatanHandler, getCatatansHandler, getCatatanByIdHandler, updateCatatanHandler, deleteCatatanHandler, getFilteredCatatansHandler, tambahTodoItemHandler, updateTodoItemHandler, hapusTodoItemHandler, hapusCatatanBeresHandler };