import { Router } from "express";
import { adminRegister, adminLogin, studentRegister, studentLogin, me, logout } from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.js";

const r = Router();

r.post("/admin/register", adminRegister);
r.post("/admin/login", adminLogin);
r.post("/student/register", studentRegister);
r.post("/student/login", studentLogin);
r.get("/me", authRequired, me);
r.post("/logout", authRequired, logout);

export default r;
