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
    if (!username || !password || !nama || !nis || !kelas || !alamat || !no_hp) {
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
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
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
