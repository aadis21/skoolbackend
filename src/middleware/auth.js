import { fail } from "../utils/response.js";
import { verifyToken } from "../utils/jwt.js";

export function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return fail(res, 401, "Unauthorized: Missing token");

  try {
    const payload = verifyToken(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return fail(res, 401, "Unauthorized: Invalid token");
  }
}
