import { db } from '../config/db.js';
import bcrypt from 'bcrypt';

export async function getAllUsers(req, res) {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id, 
        u.username, 
        u.role, 
        u.id_siswa, 
        u.id_pembina,
        COALESCE(s.nama, p.nama) AS nama
      FROM user u
      LEFT JOIN siswa s ON u.id_siswa = s.id
      LEFT JOIN pembina p ON u.id_pembina = p.id
    `);

    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUserByRole(req, res) {
  const { role } = req.params;
  try {
    const [users] = await db.query('SELECT * FROM user WHERE role = ?', [role]);
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Get user dari role error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUserByNis(req, res) {
  const { nis } = req.params;
  try {
    const [users] = await db.query('SELECT * FROM siswa WHERE nis = ?', [nis]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    }

    return res.status(200).json({ success: true, data: users[0] });
  } catch (err) {
    console.error('Error get user by NIS:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


export async function getUserByNip(req, res){
  const { nip } = req.params;
  try {
    const [users] = await db.query('SELECT * FROM pembina WHERE nip = ?', [nip])

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Pembina tidak ditemukan' });
    }
    
    return res.status(200).json({ success: true, data: users[0] });
  } catch (err) {
    console.error('Error get user by NIP:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function addPembina(req, res) {
  const { username, password, nama, nip, jabatan, no_hp } = req.body;

  if (!username || !password || !nama || !nip) {
    return res.status(400).json({ success: false, message: 'username, password, nama, dan nip wajib diisi' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const [resultPembina] = await db.query(
      'INSERT INTO pembina (nama, nip, jabatan, no_hp) VALUES (?, ?, ?, ?)',
      [nama, nip, jabatan || null, no_hp || null]
    );

    const idPembina = resultPembina.insertId;

    const [resultUser] = await db.query(
      'INSERT INTO user (username, password, role, id_pembina) VALUES (?, ?, ?, ?)',
      [username, hashed, 'pembina', idPembina]
    );

    return res.status(201).json({
      success: true,
      message: 'Pembina berhasil ditambahkan',
      data: {
        id: resultUser.insertId,
        username,
        role: 'pembina',
        nama,
        nip,
        jabatan,
        no_hp
      }
    });
  } catch (err) {
    console.error('Error menambahkan pembina:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateUserRole(req, res) {
  const { id, role } = req.body;

  if (!id || !role) {
    return res.status(400).json({ success: false, message: 'id dan role wajib diisi' });
  }

  const validRoles = ['admin', 'pembina', 'siswa'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Role tidak valid' });
  }

  try {
    const [result] = await db.query('UPDATE user SET role = ? WHERE id = ?', [role, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    return res.status(200).json({ success: true, message: `Role user berhasil diperbarui menjadi ${role}` });
  } catch (err) {
    console.error('Error memperbarui role user:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createUser(req, res) {
  const { username, password, nama, role, nis, nip } = req.body;

  if (!username || !password || !nama || !role) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }

  const validRoles = ['admin', 'pembina', 'siswa'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Role tidak valid' });
  }

  if (role === 'siswa' && !nis) {
    return res.status(400).json({ success: false, message: 'NIS wajib diisi untuk siswa' });
  }
  if (role === 'pembina' && !nip) {
    return res.status(400).json({ success: false, message: 'NIP wajib diisi untuk pembina' });
  }

  try {
    const [existingUser] = await db.query('SELECT id FROM user WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah terdaftar' });
    }

    const hashed = await bcrypt.hash(password, 10);

    if (role === 'siswa') {
      const [resultSiswa] = await db.query(
        'INSERT INTO siswa (nama, nis) VALUES (?, ?)',
        [nama, nis]
      );
      const idSiswa = resultSiswa.insertId;
      const [resultUser] = await db.query(
        'INSERT INTO user (username, password, role, id_siswa) VALUES (?, ?, ?, ?)',
        [username, hashed, role, idSiswa]
      );

      return res.status(201).json({
        success: true,
        message: 'Siswa berhasil ditambahkan',
        data: {
          id: resultUser.insertId,
          username,
          nama,
          role,
          nis,
        }
      });
    } else if (role === 'pembina') {
      const [resultPembina] = await db.query(
        'INSERT INTO pembina (nama, nip) VALUES (?, ?)',
        [nama, nip]
      );
      const idPembina = resultPembina.insertId;
      const [resultUser] = await db.query(
        'INSERT INTO user (username, password, role, id_pembina) VALUES (?, ?, ?, ?)',
        [username, hashed, role, idPembina]
      );

      return res.status(201).json({
        success: true,
        message: 'Pembina berhasil ditambahkan',
        data: {
          id: resultUser.insertId,
          username,
          nama,
          role,
          nip,
        }
      });
    } else if (role === 'admin') {
      const [resultUser] = await db.query(
        'INSERT INTO user (username, password, role) VALUES (?, ?, ?)',
        [username, hashed, role]
      );

      return res.status(201).json({
        success: true,
        message: 'Admin berhasil ditambahkan',
        data: {
          id: resultUser.insertId,
          username,
          nama,
          role,
        }
      });
    }
  } catch (err) {
    console.error('Error membuat user:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID user wajib diisi' });
  }

  try {
    const [user] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    const [result] = await db.query('DELETE FROM user WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gagal menghapus user' });
    }

    return res.status(200).json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) {
    console.error('Error menghapus user:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
