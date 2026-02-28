import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema({
  scope: { type: String, enum: ["course", "chapter"], required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ["pdf", "doc", "link", "text"], default: "link" },
  url: { type: String, default: "" },
  content: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Material", MaterialSchema);
