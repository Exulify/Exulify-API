import express from 'express';
import { getAllEskul, addEskul, addPembinaToEskul, addKegiatan, addPendaftar, addKehadiran, getEskulBySiswa } from '../controllers/eskul.controller.js';
const router = express.Router();

router.get('/', getAllEskul);
router.post('/addeskul', addEskul);
router.post('/add-pembina', addPembinaToEskul);
router.post('/add-kegiatan', addKegiatan);
router.post('/add-pendaftar', addPendaftar);
router.post('/add-kehadiran', addKehadiran);
router.get('/siswa/:id_siswa', getEskulBySiswa);


export default router;