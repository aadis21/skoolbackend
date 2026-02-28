import { Router } from "express";
import { dashboard, courseDetails, lecturePlay } from "../controllers/student.controller.js";
import { authRequired } from "../middleware/auth.js";

const r = Router();

// Student Dashboard: class-wise courses + pricing + purchasedClasses
r.get("/dashboard", authRequired, dashboard);

// Course Details: chapters + lectures lock/unlock + course materials
r.get("/course/:courseId", authRequired, courseDetails);

// Play lecture: returns videoUrl if free preview or purchased class
r.get("/play/:lectureId", authRequired, lecturePlay);

export default r;
