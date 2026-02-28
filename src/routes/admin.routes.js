import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  adminDashboardSummary,
  upsertPricing,
  createCourse,
  updateCourse,
  listCourses,
  createChapter,
  updateChapter,
  listChapters,
  createLecture,
  updateLecture,
  listLectures,
  createMaterial,
  updateMaterial,
  deleteCourse,
  deleteChapter,
  deleteLecture,
  getUsersByClass,
  listMaterials
} from "../controllers/admin.controller.js";

import { authRequired } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");

// 📸 Configure multer for thumbnail uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "thumbnail-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const r = express.Router();

// 🔐 All admin routes protected
r.use(authRequired, isAdmin);

// ✅ PRICING ROUTE
r.post("/pricing", upsertPricing);

// ✅ DASHBOARD ROUTE
r.get("/dashboard", adminDashboardSummary);

// Courses
r.post("/courses", upload.single("thumbnail"), createCourse);
r.put("/courses/:id", updateCourse);
r.get("/courses", listCourses);

// Chapters
r.post("/chapters", createChapter);
r.put("/chapters/:id", updateChapter);
r.get("/chapters", listChapters);

// Lectures
r.post("/lectures", createLecture);
r.put("/lectures/:id", updateLecture);
r.get("/lectures", listLectures);

// Materials
r.post("/materials", createMaterial);
r.put("/materials/:id", updateMaterial);
r.get("/materials", listMaterials);
r.delete("/courses/:id", deleteCourse);
// Delete chapter/lecture
r.delete("/chapters/:id", deleteChapter);
r.delete("/lectures/:id", deleteLecture);

// Users by class
r.get("/users-by-class", getUsersByClass);

export default r;
