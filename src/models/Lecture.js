import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
  title: { type: String, required: true, trim: true },
  orderNo: { type: Number, default: 1 },
  videoUrl: { type: String, required: true }, // YouTube unlisted URL
  isFreePreview: { type: Boolean, default: false },
  durationSeconds: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Lecture", LectureSchema);
