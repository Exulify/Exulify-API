import { db } from '../config/db.js';

export async function getKehadiranForPembina(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Resolve pembina id from user table (user.id -> user.id_pembina)
    const [userRows] = await db.query('SELECT id_pembina FROM user WHERE id = ?', [userId]);
    const pembinaId = (userRows && userRows[0] && userRows[0].id_pembina) || null;
    console.log('[kehadiran.controller] getKehadiranForPembina called for userId:', userId, 'resolved pembinaId:', pembinaId);

    if (!pembinaId) {
      // User is not linked to a pembina record
      return res.status(403).json({ success: false, message: 'User bukan pembina atau tidak terkait pembina' });
    }

    const [rows] = await db.query(
      `SELECT k.id AS kehadiran_id, s.nama AS siswa_nama, e.nama AS ekskul_nama, k.tanggal, k.keterangan
       FROM kehadiran k
       JOIN pendaftaran p ON k.id_pendaftaran = p.id
       JOIN siswa s ON p.id_siswa = s.id
       JOIN ekstrakurikuler e ON p.id_ekskul = e.id
       WHERE e.id_pembina = ?
       ORDER BY k.tanggal DESC`,
      [pembinaId]
    );

    console.log('[kehadiran.controller] rows returned:', Array.isArray(rows) ? rows.length : 0);

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Gagal mengambil kehadiran untuk pembina:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function exportKehadiranCsvForPembina(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Resolve pembina id from user table
    const [userRows] = await db.query('SELECT id_pembina FROM user WHERE id = ?', [userId]);
    const pembinaId = (userRows && userRows[0] && userRows[0].id_pembina) || null;
    if (!pembinaId) {
      return res.status(403).json({ success: false, message: 'User bukan pembina atau tidak terkait pembina' });
    }

    const [rows] = await db.query(
      `SELECT k.id AS kehadiran_id, s.nama AS siswa_nama, e.nama AS ekskul_nama, k.tanggal, k.keterangan
       FROM kehadiran k
       JOIN pendaftaran p ON k.id_pendaftaran = p.id
       JOIN siswa s ON p.id_siswa = s.id
       JOIN ekstrakurikuler e ON p.id_ekskul = e.id
       WHERE e.id_pembina = ?
       ORDER BY k.tanggal DESC`,
      [pembinaId]
    );

    // Build CSV
    const header = ['kehadiran_id', 'siswa_nama', 'ekskul_nama', 'tanggal', 'keterangan'];
    const csvRows = [header.join(',')];
    for (const r of rows) {
      // Escape quotes and commas by wrapping field in double quotes and doubling internal quotes
      const fields = [r.kehadiran_id, r.siswa_nama, r.ekskul_nama, r.tanggal, r.keterangan].map(f => {
        if (f === null || f === undefined) return '';
        const s = String(f).replace(/"/g, '""');
        return `"${s}"`;
      });
      csvRows.push(fields.join(','));
    }

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="kehadiran.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Gagal mengekspor kehadiran:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
