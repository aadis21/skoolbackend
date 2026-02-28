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

  // Find docs missing numeric classNumber but having other fields
  const candidates = await Course.find({
    $or: [
      { classNumber: { $exists: false } },
      { classNumber: { $type: "string" } },
    ],
  });

  console.log(`Found ${candidates.length} candidate course(s) to inspect`);
  for (const c of candidates) {
    let fixed = false;
    const values = [c.classNumber, c.class, c.classId];
    for (const v of values) {
      if (v != null) {
        const num = Number(v);
        if (!Number.isNaN(num) && num >= 1 && num <= 12) {
          c.classNumber = num;
          // remove legacy fields if present
          if (c.class != null) c.class = undefined;
          if (c.classId != null) c.classId = undefined;
          await c.save();
          console.log(`Updated course ${c._id} -> classNumber=${num}`);
          fixed = true;
          break;
        }
      }
    }
    if (!fixed) {
      console.log(`Skipped ${c._id} (no valid class value)`);
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
