import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getAllUsers,
  deleteUser,
  getAlumni,
  upload,
} from "../controllers/userController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/upload-photo", authenticate, upload.single('profilePhoto'), uploadProfilePhoto);
router.get("/alumni", authenticate, getAlumni);
router.get("/all", authenticate, requireRole("admin"), getAllUsers);
router.delete("/:id", authenticate, requireRole("admin"), deleteUser);

export default router;
