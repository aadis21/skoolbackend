import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Lecture from "../models/Lecture.js";
import Material from "../models/Material.js";
import Pricing from "../models/Pricing.js";
import { ok, fail } from "../utils/response.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

/**
 * ✅ Upsert Pricing (Create or Update)
 */
export async function upsertPricing(req, res) {
  try {
    const { classNumber, price6Months, price1Year } = req.body;

    if (!classNumber || !price6Months || !price1Year) {
      return fail(res, 400, "Missing required fields");
    }

    const pricing = await Pricing.findOneAndUpdate(
      { classNumber: Number(classNumber) },
      {
        classNumber: Number(classNumber),
        price6Months: Number(price6Months),
        price1Year: Number(price1Year),
      },
      { upsert: true, new: true }
    );

    return ok(res, { pricing }, "Pricing set successfully");
  } catch (e) {
    return fail(res, 500, "Pricing upsert failed", e.message);
  }
}

export async function createCourse(req, res) {
  try {
    const payload = {
      classNumber: Number(req.body.classNumber),
      title: req.body.title,
      description: req.body.description || "",
      price6Months: req.body.price6Months || 0,
      price1Year: req.body.price1Year || 0,
    };

    // Handle thumbnail upload
    if (req.file) {
      payload.thumbnailUrl = `/uploads/${req.file.filename}`;
    }

    const c = await Course.create(payload);
    return ok(res, { course: c }, "Course created");
  } catch (e) {
    return fail(res, 400, "Course create failed", e.message);
  }
}

export async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const c = await Course.findByIdAndUpdate(id, req.body, { new: true });
    if (!c) return fail(res, 404, "Course not found");
    return ok(res, { course: c }, "Course updated");
  } catch (e) {
    return fail(res, 400, "Course update failed", e.message);
  }
}

export async function listCourses(req, res) {
  try {
    const classNumber = req.query.classNumber ? Number(req.query.classNumber) : null;
    const q = {};
    if (classNumber) q.classNumber = classNumber;
    const courses = await Course.find(q).sort({ createdAt: -1 });
    return ok(res, { courses }, "Courses");
  } catch (e) {
    return fail(res, 500, "Courses fetch failed", e.message);
  }
}

export async function createChapter(req, res) {
  try {
    const payload = {
      ...req.body,
      title: (req.body?.title || "").trim(),
      orderNo: Number(req.body?.orderNo || 1),
    };

    if (!payload.courseId) return fail(res, 400, "courseId required");
    if (!payload.title) return fail(res, 400, "Chapter title is required");

    const ch = await Chapter.create(payload);
    return ok(res, { chapter: ch }, "Chapter created");
  } catch (e) {
    return fail(res, 400, "Chapter create failed", e.message);
  }
}

export async function updateChapter(req, res) {
  try {
    const { id } = req.params;
    const ch = await Chapter.findByIdAndUpdate(id, req.body, { new: true });
    if (!ch) return fail(res, 404, "Chapter not found");
    return ok(res, { chapter: ch }, "Chapter updated");
  } catch (e) {
    return fail(res, 400, "Chapter update failed", e.message);
  }
}

export async function listChapters(req, res) {
  try {
    const { courseId } = req.query;
    if (!courseId) return fail(res, 400, "courseId required");
    const chapters = await Chapter.find({ courseId }).sort({ orderNo: 1 });
    return ok(res, { chapters }, "Chapters");
  } catch (e) {
    return fail(res, 500, "Chapters fetch failed", e.message);
  }
}

/** ✅ FIXED: prevent crash + required fields check */
export async function createLecture(req, res) {
  try {
    const payload = {
      ...req.body,
      title: (req.body?.title || "").trim(),
      videoUrl: (req.body?.videoUrl || "").trim(),
      orderNo: Number(req.body?.orderNo || 1),
      isFreePreview: !!req.body?.isFreePreview,
    };

    if (!payload.chapterId) return fail(res, 400, "chapterId required");
    if (!payload.title) return fail(res, 400, "Lecture title is required");
    if (!payload.videoUrl) return fail(res, 400, "Lecture videoUrl is required");

    const lec = await Lecture.create(payload);
    return ok(res, { lecture: lec }, "Lecture created");
  } catch (e) {
    // ✅ mongoose validation safe response
    return fail(res, 400, "Lecture create failed", e.message);
  }
}

export async function updateLecture(req, res) {
  try {
    const { id } = req.params;
    const lec = await Lecture.findByIdAndUpdate(id, req.body, { new: true });
    if (!lec) return fail(res, 404, "Lecture not found");
    return ok(res, { lecture: lec }, "Lecture updated");
  } catch (e) {
    return fail(res, 400, "Lecture update failed", e.message);
  }
}

export async function listLectures(req, res) {
  try {
    const { chapterId } = req.query;
    if (!chapterId) return fail(res, 400, "chapterId required");
    const lectures = await Lecture.find({ chapterId }).sort({ orderNo: 1 });
    return ok(res, { lectures }, "Lectures");
  } catch (e) {
    return fail(res, 500, "Lectures fetch failed", e.message);
  }
}

export async function createMaterial(req, res) {
  try {
    const payload = {
      ...req.body,
      title: (req.body?.title || "").trim(),
      url: (req.body?.url || "").trim(),
    };

    if (!payload.scope) return fail(res, 400, "scope required (course/chapter)");
    if (!payload.title) return fail(res, 400, "Material title is required");
    if (!payload.url) return fail(res, 400, "Material url is required");

    if (payload.scope === "course" && !payload.courseId) return fail(res, 400, "courseId required");
    if (payload.scope === "chapter" && !payload.chapterId) return fail(res, 400, "chapterId required");

    const m = await Material.create(payload);
    return ok(res, { material: m }, "Material created");
  } catch (e) {
    return fail(res, 400, "Material create failed", e.message);
  }
}

export async function updateMaterial(req, res) {
  try {
    const { id } = req.params;
    const m = await Material.findByIdAndUpdate(id, req.body, { new: true });
    if (!m) return fail(res, 404, "Material not found");
    return ok(res, { material: m }, "Material updated");
  } catch (e) {
    return fail(res, 400, "Material update failed", e.message);
  }
}

export async function listMaterials(req, res) {
  try {
    const { courseId, chapterId } = req.query;
    if (!courseId && !chapterId) return fail(res, 400, "courseId or chapterId required");

    const q = {};
    if (courseId) {
      q.scope = "course";
      q.courseId = courseId;
    }
    if (chapterId) {
      q.scope = "chapter";
      q.chapterId = chapterId;
    }

    const materials = await Material.find(q).sort({ createdAt: -1 });
    return ok(res, { materials }, "Materials");
  } catch (e) {
    return fail(res, 500, "Materials fetch failed", e.message);
  }
}

/**
 * ✅ Admin Dashboard Summary (Enhanced)
 */
export async function adminDashboardSummary(req, res) {
  try {
    const now = new Date();

    // Fetch all data in parallel
    const [totalStudents, totalCourses, paidOrders, recentStudentsRaw, allUsers] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Course.countDocuments({}),
      Order.find({ status: "paid" }),
      User.find({ role: "student" }).sort({ createdAt: -1 }).limit(10),
      User.find({ role: "student" }),
    ]);

    // Calculate total revenue
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Split revenue by plan
    const revenue6Months = paidOrders
      .filter((o) => o.plan === "6m")
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const revenue1Year = paidOrders
      .filter((o) => o.plan === "1y")
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    // Count subscription statuses
    let activeSubscriptions = 0;
    let expiringSoonSubscriptions = 0;
    let expiredSubscriptions = 0;

    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const order of paidOrders) {
      if (order.endDate > now) {
        if (order.endDate <= thirtyDaysLater) {
          expiringSoonSubscriptions++;
        } else {
          activeSubscriptions++;
        }
      } else {
        expiredSubscriptions++;
      }
    }

    // Class-wise purchase analysis
    const classPurchasesMap = new Map();
    for (const order of paidOrders) {
      const key = order.classNumber;
      if (!classPurchasesMap.has(key)) {
        classPurchasesMap.set(key, {
          classNumber: order.classNumber,
          sales6Months: 0,
          sales1Year: 0,
          totalSales: 0,
          revenue: 0,
        });
      }

      const cp = classPurchasesMap.get(key);
      if (order.plan === "6m") {
        cp.sales6Months++;
      } else if (order.plan === "1y") {
        cp.sales1Year++;
      }
      cp.totalSales++;
      cp.revenue += order.amount || 0;
    }

    const classPurchases = Array.from(classPurchasesMap.values()).sort(
      (a, b) => a.classNumber - b.classNumber
    );

    // Recently registered students
    const recentStudents = recentStudentsRaw.map((u) => ({
      name: u.name,
      email: u.email,
      class: u.classSelected,
      registered: u.createdAt,
      status: u.purchases && u.purchases.length > 0 ? "Purchased" : "Registered",
    }));

    // Student purchase history
    const studentPurchases = [];
    for (const user of allUsers) {
      if (user.purchases && user.purchases.length > 0) {
        for (const purchase of user.purchases) {
          studentPurchases.push({
            studentName: user.name,
            email: user.email,
            class: user.classSelected,
            plan: purchase.plan === "6m" ? "6-Month" : "12-Month",
            amount: purchase.amount,
            purchased: purchase.startDate,
            expires: purchase.endDate,
          });
        }
      }
    }

    return ok(
      res,
      {
        totalStudents,
        totalRevenue,
        revenue6Months,
        revenue1Year,
        activeSubscriptions,
        expiringSoonSubscriptions,
        expiredSubscriptions,
        totalCourses,
        classPurchases,
        recentStudents,
        studentPurchases,
      },
      "Admin dashboard"
    );
  } catch (e) {
    return fail(res, 500, "Dashboard fetch failed", e.message);
  }
}

/**
 * ✅ Delete course (cascade delete)
 */
export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    const chapters = await Chapter.find({ courseId: id }, { _id: 1 });
    const chapterIds = chapters.map((x) => x._id);

    await Lecture.deleteMany({ chapterId: { $in: chapterIds } });

    await Material.deleteMany({
      $or: [
        { scope: "course", courseId: id },
        { scope: "chapter", chapterId: { $in: chapterIds } },
      ],
    });

    await Chapter.deleteMany({ courseId: id });

    const c = await Course.findByIdAndDelete(id);
    if (!c) return fail(res, 404, "Course not found");

    return ok(res, { deleted: true }, "Course deleted");
  } catch (e) {
    return fail(res, 500, "Delete failed", e.message);
  }
}

export async function deleteChapter(req, res) {
  try {
    const { id } = req.params;

    // remove lectures under this chapter
    await Lecture.deleteMany({ chapterId: id });

    // remove materials scoped to this chapter
    await Material.deleteMany({ scope: "chapter", chapterId: id });

    const ch = await Chapter.findByIdAndDelete(id);
    if (!ch) return fail(res, 404, "Chapter not found");

    return ok(res, { deleted: true }, "Chapter deleted");
  } catch (e) {
    return fail(res, 500, "Delete chapter failed", e.message);
  }
}

export async function deleteLecture(req, res) {
  try {
    const { id } = req.params;
    const lec = await Lecture.findByIdAndDelete(id);
    if (!lec) return fail(res, 404, "Lecture not found");
    return ok(res, { deleted: true }, "Lecture deleted");
  } catch (e) {
    return fail(res, 500, "Delete lecture failed", e.message);
  }
}

/**
 * Get all users grouped by class
 */
export async function getUsersByClass(req, res) {
  try {
    const classNumber = req.query.classNumber ? Number(req.query.classNumber) : null;
    
    let users;
    if (classNumber) {
      // Filter by specific class
      users = await User.find(
        { classSelected: classNumber, role: "student" },
        { name: 1, email: 1, phone: 1, classSelected: 1, stream: 1, purchases: 1, createdAt: 1 }
      ).sort({ createdAt: -1 });
    } else {
      // Get all students
      users = await User.find(
        { role: "student" },
        { name: 1, email: 1, phone: 1, classSelected: 1, stream: 1, purchases: 1, createdAt: 1 }
      ).sort({ classSelected: 1, createdAt: -1 });
    }

    // Group by class if no specific class filter
    let data;
    if (!classNumber) {
      data = {};
      for (let c = 1; c <= 12; c++) {
        data[c] = users.filter(u => u.classSelected === c);
      }
    } else {
      data = users;
    }

    return ok(res, { users: data }, "Users retrieved");
  } catch (e) {
    return fail(res, 500, "Failed to fetch users", e.message);
  }
}
