import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 8080;

async function main() {
  console.log("MONGO_URI =", process.env.MONGO_URI); // debug

  await connectDB(process.env.MONGO_URI);

  const app = createApp();
  app.listen(PORT, () =>
    console.log(`✅ API running on http://localhost:${PORT}`)
  );
}

main().catch((e) => {
  console.error("❌ Server failed:", e);
  process.exit(1);
});
