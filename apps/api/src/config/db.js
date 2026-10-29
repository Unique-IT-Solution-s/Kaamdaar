import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
  try {
    const connectionDb = await mongoose.connect(process.env.MONGO_URL);

    console.log(`MongoDB connected: ${connectionDb.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDb;