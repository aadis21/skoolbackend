import crypto from "crypto";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { ok, fail } from "../utils/response.js";

/**
 * Create Razorpay order
 * POST /payment/create-order
 * Body: { classNumber, plan } where plan is "6m" or "1y"
 */
export async function createOrder(req, res) {
  try {
    const { classNumber, plan } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!classNumber || !plan) {
      return fail(res, 400, "classNumber and plan are required");
    }
    if (!["6m", "1y"].includes(plan)) {
      return fail(res, 400, "plan must be '6m' or '1y'");
    }

    // Get Razorpay instance (will throw if credentials missing)
    let razorpayInstance;
    try {
      const Razorpay = (await import("razorpay")).default;
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } catch (initErr) {
      return fail(res, 500, "Razorpay configuration error: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set", initErr.message);
    }

    // Fetch pricing for this class
    const Pricing = (await import("../models/Pricing.js")).default;
    const pricing = await Pricing.findOne({ classNumber: Number(classNumber), isActive: true });
    if (!pricing) {
      return fail(res, 404, "Pricing not found for this class");
    }

    // Calculate amount based on plan
    const amount = plan === "6m" ? pricing.price6Months : pricing.price1Year;
    if (!amount || amount <= 0) {
      return fail(res, 400, "Invalid pricing for selected plan");
    }

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${userId}_${classNumber}_${Date.now()}`,
      payment_capture: true, // Auto-capture payment after success
    });

    // Save order in DB
    const order = await Order.create({
      userId,
      classNumber: Number(classNumber),
      plan,
      amount,
      currency: "INR",
      providerOrderId: razorpayOrder.id,
      status: "pending",
      provider: "razorpay",
    });

    // Fetch user for frontend
    const user = await User.findById(userId);

    return ok(res, {
      order: {
        id: order._id,
        providerOrderId: razorpayOrder.id,
        amount: order.amount,
        currency: order.currency,
        classNumber: order.classNumber,
        plan: order.plan,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    }, "Order created");
  } catch (e) {
    console.error("Create order error:", e);
    return fail(res, 500, "Failed to create order", e.message);
  }
}

/**
 * Verify Razorpay payment signature
 * POST /payment/verify
 * Body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function verifyOrder(req, res) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return fail(res, 400, "Missing required payment fields");
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return fail(res, 402, "Payment signature verification failed");
    }

    // Find and update order
    const order = await Order.findById(orderId);
    if (!order) {
      return fail(res, 404, "Order not found");
    }

    if (order.userId.toString() !== userId) {
      return fail(res, 403, "Unauthorized: Order does not belong to this user");
    }

    // Mark order as paid
    order.status = "paid";
    order.providerPaymentId = razorpay_payment_id;
    order.providerSignature = razorpay_signature;
    await order.save();

    // Add purchase to user
    const user = await User.findById(userId);
    const classNumber = order.classNumber;
    const planMonths = order.plan === "6m" ? 6 : 12;
    const now = new Date();
    const endDate = new Date(now.getTime() + planMonths * 30 * 24 * 60 * 60 * 1000);

    // Check if user already has this class purchase (prevent duplicates)
    const existingPurchase = (user.purchases || []).find(p => p.classNumber === classNumber);
    if (existingPurchase) {
      // Extend existing purchase if new one is later
      if (endDate > new Date(existingPurchase.endDate)) {
        existingPurchase.endDate = endDate;
        existingPurchase.orderId = order._id;
      }
    } else {
      // Add new purchase
      user.purchases.push({
        classNumber,
        plan: order.plan,
        amount: order.amount,
        provider: "razorpay",
        orderId: order._id,
        startDate: now,
        endDate,
      });
    }
    await user.save();

    return ok(res, {
      order: {
        id: order._id,
        status: order.status,
        classNumber: order.classNumber,
        plan: order.plan,
        amount: order.amount,
      },
      user: {
        id: user._id,
        purchases: user.purchases,
      },
    }, "Payment verified and processed");
  } catch (e) {
    console.error("Verify order error:", e);
    return fail(res, 500, "Failed to verify payment", e.message);
  }
}

/**
 * Get payment status
 * GET /payment/status/:orderId
 */
export async function getOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return fail(res, 404, "Order not found");
    }

    if (order.userId.toString() !== userId) {
      return fail(res, 403, "Unauthorized");
    }

    return ok(res, { order }, "Order status");
  } catch (e) {
    return fail(res, 500, "Failed to get order status", e.message);
  }
}
