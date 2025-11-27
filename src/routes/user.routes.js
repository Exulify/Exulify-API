import express from 'express';
import { getAllUsers, getUserByNis, getUserByNip, getUserByRole, addPembina, createUser, updateUserRole, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

// Specific routes first to avoid conflicts
router.get('/all', getAllUsers); // Alias for admin dashboard
router.post('/create', createUser); // Create new user (for admin dashboard)
router.post('/update-role', updateUserRole); // Update user role (for admin dashboard)
router.delete('/delete/:id', deleteUser); // Delete user (for admin dashboard)

// General routes
router.get('/', getAllUsers);
router.get('/role/:role', getUserByRole);
router.get('/nis/:nis', getUserByNis);
router.get('/nip/:nip', getUserByNip);
router.post('/addpembina', addPembina);

export default router;