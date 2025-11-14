import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { userSession } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/session", userSession);

export default router;
