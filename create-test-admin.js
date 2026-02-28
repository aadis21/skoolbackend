import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { signToken } from "./src/utils/jwt.js";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function createTestAdmin() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const email = "admin@test.com";
    const password = "Admin@123";
    const name = "Test Admin";
    const phone = "9999999999";

    // Check if admin exists
    let admin = await User.findOne({ email });
    
    if (admin) {
      console.log(`✅ Admin user already exists: ${email}`);
    } else {
      const passwordHash = await bcryptjs.hash(password, 10);
      admin = await User.create({
        role: "admin",
        name,
        email,
        phone,
        passwordHash,
      });
      console.log(`✅ Admin user created: ${email}`);
    }

    // Generate JWT token
    const token = signToken(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET
    );

    console.log("\n📋 Test Admin Credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\n🔐 JWT Token (for localStorage):`);
    console.log(token);
    console.log("\n💡 Steps to test:");
    console.log("1. Open http://localhost:5174/ in your browser");
    console.log("2. Open Developer Console (F12)");
    console.log("3. Run: localStorage.setItem('token', '<paste-token-above>')");
    console.log("4. Refresh page and navigate to Manage Content");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

createTestAdmin();
