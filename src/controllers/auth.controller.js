import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { ok, fail } from "../utils/response.js";
import { signToken } from "../utils/jwt.js";

function sanitizeUser(u) {
  return {
    id: u._id,
    role: u.role,
    name: u.name,
    email: u.email,
    phone: u.phone,
    classSelected: u.classSelected,
    stream: u.stream,
    state: u.state,
    city: u.city,
  };
}

export async function adminRegister(req, res) {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return fail(res, 409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const u = await User.create({
    role: "admin",
    name, email, phone, passwordHash
  });

  return ok(res, { user: sanitizeUser(u) }, "Admin registered");
}

export async function adminLogin(req, res) {
  const { email, password } = req.body;
  const u = await User.findOne({ email, role: "admin" });
  if (!u) return fail(res, 401, "Invalid credentials");

  const okPwd = await bcrypt.compare(password, u.passwordHash);
  if (!okPwd) return fail(res, 401, "Invalid credentials");

  const token = signToken({ id: u._id, role: u.role }, process.env.JWT_SECRET);
  return ok(res, { token, user: sanitizeUser(u) }, "Admin logged in");
}

export async function studentRegister(req, res) {
  const { name, email, phone, password, classSelected, stream, state, city } = req.body;

  // Validate state and city
  if (!state || !state.trim()) {
    return fail(res, 400, "State is required");
  }
  if (!city || !city.trim()) {
    return fail(res, 400, "City is required");
  }

  const exists = await User.findOne({ email });
  if (exists) return fail(res, 409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const u = await User.create({
    role: "student",
    name, email, phone, passwordHash,
    classSelected,
    stream: stream || "NA",
    state: state.trim(),
    city: city.trim(),
  });

  return ok(res, { user: sanitizeUser(u) }, "Student registered");
}

export async function studentLogin(req, res) {
  const { email, password } = req.body;
  const u = await User.findOne({ email, role: "student" });
  if (!u) return fail(res, 401, "Invalid credentials");

  const okPwd = await bcrypt.compare(password, u.passwordHash);
  if (!okPwd) return fail(res, 401, "Invalid credentials");

  const token = signToken({ id: u._id, role: u.role }, process.env.JWT_SECRET);
  return ok(res, { token, user: sanitizeUser(u) }, "Student logged in");
}

export async function me(req, res) {
  const u = await User.findById(req.user.id);
  if (!u) return fail(res, 404, "User not found");
  return ok(res, { user: sanitizeUser(u) }, "Me");
}
