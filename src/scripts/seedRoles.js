import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Role from "../models/Role.js";

const seedRoles = async () => {
  try {
    await connectDB();

    await Role.updateOne(
      {
        role_name: "CUSTOMER",
      },
      {
        $set: { description: "A customer who books home services" },
      },
      { upsert: true },
    );
    console.log("CUSTOMER role seeded successfully.");
  } catch (error) {
    console.error("Role seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedRoles();
