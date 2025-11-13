import { db }  from '../config/db.js';

export async function getAllEskul(req, res) {

    try {
        const [eskul] = await db.query('SELECT * FROM ekstrakurikuler')
        return res.status(200).json({ success: true, data: eskul });   
    } catch (err) {
        console.error('Gagal mendapatkan data eskul:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function addEskul(req, res){
    const { nama, deskripsi, jadwal, id_pembina } = req.body
    if (!nama || !deskripsi || !jadwal || !id_pembina) {
        return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    try {
        const [resultEskul] = await db.query(
            'INSERT INTO ekstrakurikuler (nama, deskripsi, jadwal, id_pembina) VALUES (?, ?, ?, ?)',
            [nama, deskripsi, jadwal, id_pembina]
        )
        return res.status(201).json({
            success: true,
            message: 'Eskul berhasil ditambahkan',
            data: {
                id: resultEskul.insertId,
                nama,
                deskripsi,
                jadwal,
                id_pembina
            }
        });
    } catch (err) {
        console.error('Gagal menambahkan eskul:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function addPembinaToEskul(req, res) { 
    const { id_eskul, id_pembina } = req.body;
    if (!id_eskul || !id_pembina) {
        return res.status(400).json({ success: false, message: 'id_eskul dan id_pembina wajib diisi' });
    }

    try {
        const [result] = await db.query('UPDATE ekstrakurikuler SET id_pembina = ? WHERE id = ?', [id_pembina, id_eskul]);
        res.status(200).json({
            success: true,
            message: 'Pembina berhasil ditambahkan ke eskul',
            data: {
                id_eskul,
                id_pembina
            }
        });
    } catch (err) {
        console.error('Gagal menambahkan pembina ke eskul:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function addKegiatan(req, res) {
  const { id_ekskul, nama_kegiatan, tanggal, deskripsi } = req.body;

  if (!id_ekskul || !nama_kegiatan || !tanggal || !deskripsi) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO kegiatan (id_ekskul, nama_kegiatan, tanggal, deskripsi) VALUES (?, ?, ?, ?)',
      [id_ekskul, nama_kegiatan, tanggal, deskripsi]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Eskul tidak ditemukan' });
    }
  } catch (err) {
    console.error('Error menambahkan kegiatan:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
  return res.status(201).json({ success: true, message: 'Kegiatan berhasil ditambahkan' });
}

export async function addPendaftar(req, res) {
    const { id_siswa, id_ekskul, tanggal_daftar, status } = req.body;
    if (!id_siswa || !id_ekskul || !tanggal_daftar || !status) {
        return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO pendaftar (id_siswa, id_ekskul, tanggal_daftar, status) VALUES (?, ?, ?, ?)',
            [id_siswa, id_ekskul, tanggal_daftar, status]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Eskul atau siswa tidak ditemukan' });
        }
        return res.status(201).json({
            success: true,
            message: 'Pendaftaran eskul berhasil',
            data: {
                id_siswa,
                id_ekskul,
                tanggal_daftar,
                status
            }
        });
    } catch (err) {
        console.error('Error menambahkan pendaftar:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function  addKehadiran(req, res) {
    const { id_pendaftar, tanggal, keterangan } = req.body
    if (!id_pendaftar || !tanggal || !keterangan) {
        return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO kehadiran (id_pendaftar, tanggal, keterangan) VALUES (?, ?, ?)',
            [id_pendaftar, tanggal, keterangan]
        ) 
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pendaftar tidak ditemukan' });
        }
    } catch (err) {
        console.error('Error menambahkan kehadiran:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
    return res.status(201).json({ success: true, message: 'Kehadiran berhasil ditambahkan' });
}