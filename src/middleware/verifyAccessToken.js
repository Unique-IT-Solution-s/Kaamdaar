import jwt from "jsonwebtoken";
import { sendError } from "../utils/apiResponse.js";

export const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, {
        statusCode: 401,
        code: "ACCESS_TOKEN_REQUIRED",
        message: "Please log in to continue.",
      });
    }

    // Extract the JWT from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify the signature and expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    // Make the verified token data available to controllers
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return sendError(res, {
        statusCode: 401,
        code: "INVALID_OR_EXPIRED_ACCESS_TOKEN",
        message: "Your session has expired or your token is invalid. Please log in again.",
      });
    }

    return sendError(res, {
      statusCode: 500,
      code: "AUTHENTICATION_ERROR",
      message: "Unable to authenticate your request.",
    });
  }
};
