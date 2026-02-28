import { Router } from "express";
import { getPricing } from "../controllers/pricing.controller.js";
import { getCoursesByClass, searchCourses } from "../controllers/public.controller.js";

const r = Router();

r.get("/pricing", getPricing);
r.get("/courses", getCoursesByClass);
r.get("/search", searchCourses);

export default r;
