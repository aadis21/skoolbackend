import { fail } from "../utils/response.js";

export function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") return fail(res, 403, "Forbidden: Admin only");
  return next();
}
