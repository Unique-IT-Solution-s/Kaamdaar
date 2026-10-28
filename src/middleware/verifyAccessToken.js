import jwt from "jsonwebtoken";
import { sendError } from "../utils/apiResponse.js";
import UserSession from "../models/UserSession.js";

export const verifyAccessToken = async (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (
      typeof decoded._id !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(decoded._id) ||
      typeof decoded.sessionId !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(decoded.sessionId)
    ) {
      return sendError(res, {
        statusCode: 401,
        code: "INVALID_ACCESS_TOKEN",
        message: "Invalid authentication token.",
      });
    }

    // Verify that this session still exists and belongs to the user.
    const activeSession = await UserSession.findOne({
      _id: decoded.sessionId,
      user_id: decoded._id,
      expires_at: { $gt: new Date() },                    //$gt means = greater than
    }).select("_id");

    if (!activeSession) {
      return sendError(res, {
        statusCode: 401,
        code: "SESSION_EXPIRED_OR_REVOKED",
        message: "Your session has expired or you have logged out.",
      });
    }

    // Make the verified token data available to controllers
    req.user = {
      id: decoded._id,
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
        message:
          "Your session has expired or your token is invalid. Please log in again.",
      });
    }

    return sendError(res, {
      statusCode: 500,
      code: "AUTHENTICATION_ERROR",
      message: "Unable to authenticate your request.",
    });
  }
};
