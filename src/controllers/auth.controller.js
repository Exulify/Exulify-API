import bcrypt from 'bcrypt'
import { db } from '../config/db.js'
import { generateToken } from '../utils/token.js'

export async function register(req, res) {
  const { 
    username, 
    password, 
    role, 
    nama, 
    nis,
    // nip, 
    kelas, 
    alamat, 
    no_hp,
    // jabatan 
    } = req.body;


  try {
    if (!username || !password || !nis ) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [resultSiswa] = await db.query(
      'INSERT INTO siswa (nama, nis, kelas, alamat, no_hp) VALUES (?, ?, ?, ?, ?)',
      [nama, nis, kelas, alamat, no_hp]
    );

    const id_siswa = resultSiswa.insertId;

    const [resultUser] = await db.query(
      'INSERT INTO user (username, password, id_siswa, role) VALUES (?, ?, ?, ?)',
      [
        username, 
        hashed, 
        id_siswa, 
        role || 'siswa'
    ]
    );

    const token = generateToken({
      id: resultUser.insertId,
      role: role || 'siswa'
    });

    // set token as httpOnly cookie for session endpoints
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'none',
      secure: true
    });

    return res.status(201).json({
      success: true,
      message: 'User berhasil register',
      userId: resultUser.insertId,
      siswaId: id_siswa,
      token
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true
    });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}



export const userSession = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Tidak memiliki Akses!' });
    }

    const [rows] = await db.query(`
    SELECT 
      u.id, 
      u.username, 
      u.role,
      u.id_siswa,
      u.id_pembina,
      s.nama AS nama_siswa,
      p.nama AS nama_pembina,
      pf.id AS id_pendaftaran,
      k.id AS id_kehadiran,
      pt.id AS id_prestasi
    FROM user u
    LEFT JOIN siswa s ON u.id_siswa = s.id
    LEFT JOIN pembina p ON u.id_pembina = p.id
    LEFT JOIN pendaftaran pf ON s.id = pf.id_siswa
    LEFT JOIN kehadiran k ON pf.id = k.id_pendaftaran
    LEFT JOIN prestasi pt ON s.id = pt.id_siswa
    WHERE u.id = ?
    `, [userId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = rows[0];
    const name = user.nama_siswa || user.nama_pembina || user.username;

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        name,
        id_siswa: user.id_siswa,
        id_pembina: user.id_pembina,
        id_pendaftar: user.id_pendaftaran
      }
    });

  } catch (err) {
    console.error('Error getting user session:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });

    return res.status(200).json({
      success: true,
      message: "Logout berhasil"
    });

  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan saat Logout" });
  }
}
