import express from "express";
import rateLimit from "express-rate-limit";
import { requestOtpController } from "../controllers/authController.js";

const router = express.Router();

const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later.",
    },
  },
});

router.post("/otp/request", otpRequestLimiter, requestOtpController);

export default router;
