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
            'INSERT INTO pendaftaran (id_siswa, id_ekskul, tanggal_daftar, status) VALUES (?, ?, ?, ?)',
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

export async function getEskulBySiswa(req, res) {
  const { id_siswa } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT p.*, e.nama AS nama_ekskul
      FROM pendaftaran p
      JOIN ekstrakurikuler e ON p.id_ekskul = e.id
      WHERE p.id_siswa = ?
    `, [id_siswa]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}


export const updateStreakKehadiran = async (req, res) => {
  const { id_pendaftaran } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM streak_kehadiran WHERE id_pendaftaran = ?",
      [id_pendaftaran]
    );

    const today = new Date().toISOString().split("T")[0];

    if (rows.length === 0) {
      await db.query(
        `INSERT INTO streak_kehadiran 
        (id_pendaftaran, current_streak, longest_streak, last_attendance) 
        VALUES (?, 1, 1, ?)`,
        [id_pendaftaran, today]
      );

      return res.status(201).json({
        success: true,
        message: "Streak baru dibuat.",
        data: {
          current_streak: 1,
          longest_streak: 1,
          last_attendance: today,
        },
      });
    }

    const streak = rows[0];
    const last = new Date(streak.last_attendance);
    const now = new Date(today);

    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    let newCurrent = streak.current_streak;

    if (diffDays === 1) {
      newCurrent += 1;
    } else if (diffDays > 1) {
      // Reset streak
      newCurrent = 1;
    } else if (diffDays === 0) {
      return res.status(200).json({
        success: true,
        message: "Hari ini sudah diabsen.",
        data: streak,
      });
    }

    const newLongest = Math.max(streak.longest_streak, newCurrent);

    await db.query(
      `UPDATE streak_kehadiran 
       SET current_streak = ?, longest_streak = ?, last_attendance = ?
       WHERE id_pendaftaran = ?`,
      [newCurrent, newLongest, today, id_pendaftaran]
    );

    res.status(200).json({
      success: true,
      message: "Streak diperbarui.",
      data: {
        current_streak: newCurrent,
        longest_streak: newLongest,
        last_attendance: today,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal update streak.",
      error: err.message,
    });
  }
};
