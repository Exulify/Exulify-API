import express from 'express';
import { getAllUsers, getUserByNis, getUserByNip, getUserByRole, addPembina } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/role/:role', getUserByRole);
router.get('/nis/:nis', getUserByNis);
router.get('/nip/:nip', getUserByNip);
router.post('/addpembina', addPembina);

export default router;