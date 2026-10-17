
import { createHmac, randomInt, randomUUID } from "node:crypto";
import OtpVerification from "../models/OtpVerification.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

const hashOtp = (otp) => {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret) {
    throw new Error("OTP_HASH_SECRET is not configured");
  }

  return createHmac("sha256", secret)
    .update(otp)
    .digest("hex");
};

// SMS provider integration will be added after selecting a provider.
const sendOtpSms = async () => {
  throw new Error("SMS provider is not configured");
};

export const requestOtp = async ({ mobile, purpose }) => {
  const now = new Date();

  const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const verificationId = randomUUID();

  const verification = await OtpVerification.create({
    verification_id: verificationId,
    mobile,
    purpose: purpose.toUpperCase(),
    otp_hash: hashOtp(otp),
    expires_at: new Date(now.getTime() + OTP_EXPIRY_MS),
    attempts: 0,
    max_attempts: 5,
    resend_available_at: new Date(
      now.getTime() + RESEND_COOLDOWN_MS
    ),
  });

  try {
    await sendOtpSms({ mobile, otp });
  } catch (error) {
    await OtpVerification.deleteOne({ _id: verification._id });
    throw error;
  }

  return {
    verification_id: verificationId,
    expires_in_seconds: 300,
    resend_after_seconds: 30,
  };
};
