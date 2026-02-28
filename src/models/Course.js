import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  classNumber: { type: Number, required: true, min: 1, max: 12 },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  thumbnailUrl: { type: String, default: "" },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Course", CourseSchema);
