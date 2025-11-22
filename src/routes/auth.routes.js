import express from "express";
import { register, login, logout} from "../controllers/auth.controller.js";
import { userSession } from "../controllers/auth.controller.js";
import { verifyToken  } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/session", verifyToken, userSession);
router.get("/logout", logout)

export default router;
