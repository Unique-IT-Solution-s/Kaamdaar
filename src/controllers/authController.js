import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { requestOtp } from "../services/otpService.js";

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export const requestOtpController = async (req, res) => {
  try {
    const { mobile, purpose } = req.body ?? {};

    if (
      typeof mobile !== "string" ||
      !E164_PATTERN.test(mobile) ||
      !["registration", "login"].includes(purpose)
    ) {
      return sendError(res, {
        statusCode: 422,
        code: "VALIDATION_ERROR",
        message: "Please provide a valid mobile number and purpose.",
        fields: {
          ...(typeof mobile !== "string" || !E164_PATTERN.test(mobile)
            ? { mobile: "Use E.164 format, e.g. +919876543210." }
            : {}),
          ...(!["registration", "login"].includes(purpose)
            ? { purpose: "Must be registration or login." }
            : {}),
        },
      });
    }
    const data = await requestOtp({ mobile, purpose });

    return sendSuccess(res, {
      statusCode: 200,
      message: "If eligible, a code has been sent.",
      data,
    });
  } catch (error) {
    if (error.message === "SMS provider is not configured") {
      return sendError(res, {
        statusCode: 503,
        code: "OTP_DELIVERY_UNAVAILABLE",
        message: "OTP delivery is temporarily unavailable.",
      });
    }

    if (error.message === "OTP_HASH_SECRET is not configured") {
      return sendError(res, {
        statusCode: 500,
        code: "SERVER_CONFIGURATION_ERROR",
        message: "Authentication service is not configured.",
      });
    }

    console.error("OTP request failed:", error.message);

    return sendError(res, {
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to process the OTP request.",
    });
  }
};


