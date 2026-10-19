import express from "express";
import rateLimit from "express-rate-limit";
import { requestOtpController } from "../controllers/authController.js";
import { continueAfterVerification } from "../controllers/authContinueController.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { loginCustomer } from "../controllers/customerLoginController.js";


const router = express.Router();

const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
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
router.post("/continue", verifyFirebaseToken, continueAfterVerification );
router.post("/login", verifyFirebaseToken, loginCustomer);

export default router;
