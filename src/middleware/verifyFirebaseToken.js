
import { adminAuth } from "../config/firebaseAdmin.js";
import { sendError } from "../utils/apiResponse.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return sendError(res, {
        statusCode: 401,
        code: "AUTH_TOKEN_MISSING",
        message: "Firebase ID token is required.",
      });
    }

    const idToken = authHeader.slice("Bearer ".length).trim();

    if (!idToken) {
      return sendError(res, {
        statusCode: 401,
        code: "AUTH_TOKEN_MISSING",
        message: "Firebase ID token is required.",
      });
    }

    // Verify the signature, expiry, and Firebase project identity.
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.phone_number) {
      return sendError(res, {
        statusCode: 401,
        code: "PHONE_NOT_VERIFIED",
        message: "A Firebase-verified phone number is required.",
      });
    }

    req.firebaseUser = {
      uid: decodedToken.uid,
      mobile: decodedToken.phone_number,
    };

    next();
  } catch (error) {
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error" ||
      error.code === "auth/invalid-id-token"
    ) {
      return sendError(res, {
        statusCode: 401,
        code: "INVALID_FIREBASE_TOKEN",
        message: "Firebase ID token is invalid or expired. Please sign in again.",
      });
    }

    console.error("Firebase token verification failed:", error.code || "UNKNOWN");

    return sendError(res, {
      statusCode: 401,
      code: "FIREBASE_AUTH_FAILED",
      message: "Unable to authenticate this request.",
    });
  }
};
