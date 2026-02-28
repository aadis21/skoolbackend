import Course from "../models/Course.js";
import { ok, fail } from "../utils/response.js";

export async function getCoursesByClass(req, res) {
  const classNumber = Number(req.query.classNumber || 0);
  if (!classNumber || classNumber < 1) return fail(res, 400, "Invalid classNumber");

  // Support documents that may have stored class under different field names
  // (e.g., `class`, `classId`) or as strings. Use $or to match any of them.
  const q = {
    isPublished: true,
    $or: [
      { classNumber: classNumber },
      { class: classNumber },
      { classId: classNumber },
      { classNumber: String(classNumber) },
      { class: String(classNumber) },
      { classId: String(classNumber) },
    ],
  };

  const courses = await Course.find(q).sort({ createdAt: -1 });
  return ok(res, { courses }, "Courses for class");
}

export async function searchCourses(req, res) {
  const query = req.query.q || "";
  if (query.trim().length < 2) {
    return fail(res, 400, "Search query too short");
  }

  const searchRegex = new RegExp(query, "i");
  const results = await Course.find({
    isPublished: true,
    $or: [
      { title: searchRegex },
      { description: searchRegex }
    ]
  })
    .select("_id title description classNumber")
    .limit(10)
    .sort({ createdAt: -1 });

  return ok(res, { results }, "Search results");
}
