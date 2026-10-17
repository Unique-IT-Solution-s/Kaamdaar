import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    role_name: {
      type: String,
      required: true,
      unique: true,
      enum: ["CUSTOMER", "PROVIDER", "ADMIN", "SUPER_ADMIN"],
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    }
}, {timestamps : true})

const Role = mongoose.model("Role", roleSchema)

export default Role