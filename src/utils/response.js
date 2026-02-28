export function ok(res, data = {}, message = "OK") {
  return res.json({ ok: true, message, data });
}

export function fail(res, status = 400, message = "Bad Request", details = null) {
  return res.status(status).json({ ok: false, message, details });
}
