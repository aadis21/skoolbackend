import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../src/models/Course.js";

dotenv.config({ path: "./.env" });

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri, {});
  console.log("Connected to MongoDB");

  for (let c = 1; c <= 12; c++) {
    const courses = await Course.find({ classNumber: c }).select("_id title isPublished");
    console.log(`Class ${c}: ${courses.length} course(s)`);
  }

  console.log("\nCourses for Class 4:");
  const class4 = await Course.find({ classNumber: 4 }).select("_id title description isPublished createdAt");
  if (!class4.length) console.log("  (no courses)");
  else class4.forEach(c => console.log(`  - ${c.title} (published=${c.isPublished})`));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
