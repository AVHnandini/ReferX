import express from "express";
import {
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  getAlumni,
} from "../controllers/userController.js";
import { authenticate, requireRole } from "../middleware/auth.js";
const router = express.Router();
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.get("/alumni", authenticate, getAlumni);
router.get("/all", authenticate, requireRole("admin"), getAllUsers);
router.delete("/:id", authenticate, requireRole("admin"), deleteUser);
export default router;
