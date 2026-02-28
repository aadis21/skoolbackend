import mongoose from "mongoose";

const PricingSchema = new mongoose.Schema({
  classNumber: { type: Number, required: true, min: 1, max: 12, unique: true },
  price6Months: { type: Number, required: true, min: 0 },
  price1Year: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Pricing", PricingSchema);
