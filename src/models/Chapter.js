import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true, trim: true },
  orderNo: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model("Chapter", ChapterSchema);
