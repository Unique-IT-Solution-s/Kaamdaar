
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const requestOtpController = async (req, res) => {
  const { mobile } = req.body;

  if (typeof mobile !== "string") {
    return sendError(res, {
      statusCode: 422,
      code: "INVALID_MOBILE",
      message: "Enter a valid mobile number with country code.",
      fields: {
        mobile: "Use international format, e.g. +91 9876543210.",
      },
    });
  }

  // Remove spaces and hyphens before validation
  const normalizedMobile = mobile.trim().replace(/[\s-]/g, "");

  if (!/^\+[1-9]\d{7,14}$/.test(normalizedMobile)) {
    return sendError(res, {
      statusCode: 422,
      code: "INVALID_MOBILE",
      message: "Enter a valid mobile number with country code.",
      fields: {
        mobile: "Use international format, e.g. +91 9876543210.",
      },
    });
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Mobile number accepted. Continue with Firebase verification.",
    data: {
      mobile: normalizedMobile,
    },
  });
};
