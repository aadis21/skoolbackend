import User from "../models/User.js";
import Pricing from "../models/Pricing.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Lecture from "../models/Lecture.js";
import Material from "../models/Material.js";
import { ok, fail } from "../utils/response.js";

function hasActivePurchase(user, classNumber) {
  const now = new Date();
  return (user.purchases || []).some(p => p.classNumber === classNumber && new Date(p.endDate) > now);
}

export async function dashboard(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return fail(res, 404, "User not found");

  const classNumber = user.classSelected;
  const courses = await Course.find({ classNumber, isPublished: true }).sort({ createdAt: -1 });

  // Also fetch all published courses so frontend can show all classes and their courses
  const allPublishedCoursesRaw = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
  // Normalize and build flat `allCourses` and grouped `allClasses`
  const allCourses = allPublishedCoursesRaw.map(c => ({
    _id: c._id,
    title: c.title,
    description: c.description,
    thumbnailUrl: c.thumbnailUrl,
    isPublished: c.isPublished,
    classNumber: Number(c.classNumber) || 0,
    createdAt: c.createdAt,
  }));

  const coursesByClass = {};
  for (const c of allCourses) {
    const cn = c.classNumber || 0;
    if (!coursesByClass[cn]) coursesByClass[cn] = [];
    coursesByClass[cn].push(c);
  }

  // Build classes array for classes 1..12 to guarantee visibility
  const allClasses = [];
  for (let i = 1; i <= 12; i++) {
    allClasses.push({ classNumber: i, courses: coursesByClass[i] || [] });
  }

  const purchasedClasses = (user.purchases || [])
    .filter(p => new Date(p.endDate) > new Date())
    .map(p => p.classNumber);

  const pricing = await Pricing.find({ isActive: true }).sort({ classNumber: 1 });

  // Build small notifications list (recent courses / pricing updates)
  const recentCourses = await Course.find({ isPublished: true }).sort({ createdAt: -1 }).limit(5);
  const notifications = [];
  if (recentCourses && recentCourses.length) {
    for (let i = 0; i < Math.min(3, recentCourses.length); i++) {
      const c = recentCourses[i];
      notifications.push({ id: `course-${c._id}`, type: "course", text: `New course: ${c.title}`, courseId: c._id, createdAt: c.createdAt });
    }
  }
  if (pricing && pricing.length) {
    notifications.push({ id: `pricing-${pricing[0]._id}`, type: "pricing", text: `Pricing updated for class ${pricing[0].classNumber}`, classNumber: pricing[0].classNumber });
  }

  return ok(res, {
    user: { classSelected: user.classSelected, stream: user.stream, name: user.name },
    courses,
    purchasedClasses,
    pricing,
    notifications,
    allClasses,
    allCourses
  }, "Dashboard");
}

export async function courseDetails(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return fail(res, 404, "User not found");

  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return fail(res, 404, "Course not found");

  const unlocked = hasActivePurchase(user, course.classNumber);
  const chapters = await Chapter.find({ courseId }).sort({ orderNo: 1 });

  const chapterIds = chapters.map(c => c._id);
  const lectures = await Lecture.find({ chapterId: { $in: chapterIds } }).sort({ orderNo: 1 });

  const lecturesByChapter = {};
  for (const ch of chapters) {
    lecturesByChapter[ch._id] = lectures
      .filter(l => String(l.chapterId) === String(ch._id))
      .map(l => ({
        id: l._id,
        title: l.title,
        orderNo: l.orderNo,
        isFreePreview: l.isFreePreview,
        isLocked: !(l.isFreePreview || unlocked),
      }));
  }

  const courseMaterials = await Material.find({ scope: "course", courseId }).sort({ createdAt: -1 });

  return ok(res, {
    course,
    unlocked,
    chapters: chapters.map(c => ({ id: c._id, title: c.title, orderNo: c.orderNo })),
    lecturesByChapter,
    materials: courseMaterials,
  }, "Course details");
}

export async function lecturePlay(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return fail(res, 404, "User not found");

  const { lectureId } = req.params;
  const lec = await Lecture.findById(lectureId);
  if (!lec) return fail(res, 404, "Lecture not found");

  const chapter = await Chapter.findById(lec.chapterId);
  if (!chapter) return fail(res, 404, "Chapter not found");

  const course = await Course.findById(chapter.courseId);
  if (!course) return fail(res, 404, "Course not found");

  const unlocked = hasActivePurchase(user, course.classNumber);
  if (!(lec.isFreePreview || unlocked)) return fail(res, 402, "Locked: Buy class bucket to continue");

  return ok(res, { videoUrl: lec.videoUrl, title: lec.title, courseId: course._id }, "Play");
}
