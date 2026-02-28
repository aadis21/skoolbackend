import Pricing from "../models/Pricing.js";
import { ok, fail } from "../utils/response.js";

export async function upsertPricing(req, res) {
  const { classNumber, price6Months, price1Year, currency, isActive } = req.body;
  const p = await Pricing.findOneAndUpdate(
    { classNumber },
    { classNumber, price6Months, price1Year, currency: currency || "INR", isActive: isActive ?? true },
    { upsert: true, new: true }
  );
  return ok(res, { pricing: p }, "Pricing saved");
}

export async function getPricing(req, res) {
  const classNumber = Number(req.query.classNumber);
  if (!classNumber) {
    const all = await Pricing.find({ isActive: true }).sort({ classNumber: 1 });
    return ok(res, { pricing: all }, "Pricing list");
  }
  const p = await Pricing.findOne({ classNumber, isActive: true });
  if (!p) return fail(res, 404, "Pricing not found");
  return ok(res, { pricing: p }, "Pricing");
}
