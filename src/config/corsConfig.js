/**
 * CORS Configuration
 * Centralized CORS settings for the LMS API
 * This file manages allowed origins and CORS policies
 */

// Array of allowed frontend origins
// Add your frontend URLs here for development, staging, and production environments
const allowedOrigins = [
  "http://localhost:5173",            // Local development (Vite default)
  "http://localhost:3000",            // Alternative local development
  "http://127.0.0.1:5173",            // Local development (127.0.0.1)
  "https://saariknowledge.vercel.app", // Production frontend
  // "https://www.yourdomain.com",    // Additional production environment
];

/**
 * CORS configuration object
 * Customizes CORS behavior for the application
 */
const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Block request from disallowed origin
      callback(
        new Error(
          `CORS policy: Origin "${origin}" is not allowed to access this API. ` +
          `Add it to allowedOrigins in config/corsConfig.js`
        ),
        false
      );
    }
  },
  credentials: true,                  // Allow cookies and credentials
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,         // Some legacy browsers (IE11) choke on 204
  maxAge: 86400,                     // Cache preflight requests for 24 hours
};

/**
 * Error handler for CORS violations
 * Can be used as middleware to handle CORS errors gracefully
 */
const corsErrorHandler = (err, req, res, next) => {
  if (err.message.includes("CORS policy")) {
    return res.status(403).json({
      success: false,
      message: "Access Denied",
      error: err.message,
      origin: req.get("origin"),
    });
  }
  next(err);
};

export { corsConfig, corsErrorHandler, allowedOrigins };
