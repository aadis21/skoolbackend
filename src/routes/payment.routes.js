import { Router } from "express";
import { createOrder, verifyOrder, getOrderStatus } from "../controllers/payment.controller.js";
import { authRequired } from "../middleware/auth.js";

const r = Router();

// All payment routes require authentication
r.use(authRequired);

// Create a Razorpay order
r.post("/create-order", createOrder);

// Verify payment signature after Razorpay success
r.post("/verify", verifyOrder);

// Get order status
r.get("/status/:orderId", getOrderStatus);

export default r;
