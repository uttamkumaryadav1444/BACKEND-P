import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import User from "./models/User.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    console.log("\n🔐 ===== ADMIN CREATION =====\n");

    const username = await new Promise(resolve => {
      rl.question("👤 Enter username: ", answer => resolve(answer || "admin"));
    });

    const password = await new Promise(resolve => {
      rl.question("🔑 Enter password (min 6 characters): ", answer => resolve(answer));
    });

    if (password.length < 6) {
      console.log("❌ Password must be at least 6 characters");
      rl.close();
      process.exit(1);
    }

    const email = await new Promise(resolve => {
      rl.question("📧 Enter email: ", answer => resolve(answer || `${username}@portfolio.com`));
    });

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`\n❌ User "${username}" already exists!`);
      const confirm = await new Promise(resolve => {
        rl.question("Do you want to delete and recreate? (y/n): ", answer => {
          resolve(answer.toLowerCase());
        });
      });

      if (confirm === 'y') {
        await User.deleteOne({ username });
        console.log(`✅ User "${username}" deleted`);
      } else {
        console.log("❌ Aborted");
        rl.close();
        process.exit(0);
      }
    }

    // Create admin - password will be hashed by pre-save
    const admin = new User({
      username,
      password,
      email
    });

    await admin.save();
    console.log("\n✅ Admin created successfully!");
    console.log(`👤 Username: ${username}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`📧 Email: ${email}`);
    console.log("\n🔐 You can now login!\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
  } finally {
    rl.close();
    mongoose.disconnect();
  }
};

createAdmin();