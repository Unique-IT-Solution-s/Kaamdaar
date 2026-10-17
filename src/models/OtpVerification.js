import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
    verification_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: ["REGISTRATION", "LOGIN", "MOBILE_CHANGE"],
      required: true,
    },

    otp_hash: {
      type: String,
      required: true,
      select: false,
    },

    expires_at: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    max_attempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    resend_available_at: {
      type: Date,
      required: true,
    },

    verified_at: {
      type: Date,
      default: null,
    },

    consumed_at: {
      type: Date,
      default: null,
    },

    registration_proof_hash: {
      type: String,
      default: null,
      select: false,
    },

    registration_proof_expires_at: {
      type: Date,
      default: null,
    },

    registration_proof_consumed_at: {
      type: Date,
      default: null,
    }},
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "otp_verifications",
  }
)

otpVerificationSchema.index({mobile : 1, purpose : 1, expires_at : 1})

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema)

export default OtpVerification