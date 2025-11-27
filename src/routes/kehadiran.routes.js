import express from 'express';
import { getKehadiranForPembina, exportKehadiranCsvForPembina } from '../controllers/kehadiran.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected routes for pembina
router.get('/pembina', verifyToken, getKehadiranForPembina);
router.get('/export-csv', verifyToken, exportKehadiranCsvForPembina);

export default router;
