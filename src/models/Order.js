import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  classNumber: { type: Number, required: true, min: 1, max: 12 },
  plan: { type: String, enum: ["6m", "1y"], required: true },
  amount: { type: Number, required: true }, // in INR
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["created", "paid", "failed", "cancelled"], default: "created" },
  provider: { type: String, default: "razorpay" },
  providerOrderId: { type: String, default: "" },
  providerPaymentId: { type: String, default: "" },
  providerSignature: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);
