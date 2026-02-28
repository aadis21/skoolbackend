import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  classNumber: { type: Number, required: true, min: 1, max: 12 },
  plan: { type: String, enum: ["6m", "1y"], required: true },
  amount: { type: Number, required: true },
  provider: { type: String, default: "razorpay" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ["admin", "student"], required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },

  // Student fields
  classSelected: { type: Number, min: 1, max: 12 },
  stream: { type: String, enum: ["PCM", "PCB", "NA"], default: "NA" },
  state: { type: String, required: false },
  city: { type: String, required: false },

  purchases: { type: [PurchaseSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
