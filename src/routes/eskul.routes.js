import express from 'express';
import { getAllEskul, addEskul, addPembinaToEskul, addKegiatan } from '../controllers/eskul.controller.js';
const router = express.Router();

router.get('/', getAllEskul);
router.post('/addeskul', addEskul);
router.post('/add-pembina', addPembinaToEskul);
router.post('/add-kegiatan', addKegiatan);

export default router;