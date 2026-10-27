import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const continueAfterVerification = async (req, res) => {
  try {
    // These values must come from the verified Firebase ID token.
    const { uid, mobile } = req.firebaseUser || {};

    if (!uid || !mobile) {
      return sendError(res, {
        statusCode: 401,
        code: "VERIFIED_IDENTITY_MISSING",
        message: "A verified Firebase phone identity is required.",
      });
    }

    // Look up the account associated with this verified mobile number.
    const userByMobile = await User.findOne({ mobile }).select(
      "_id mobile firebase_uid user_type is_active",
    );

    // Also look up the account associated with this Firebase UID.
    const userByFirebaseUid = await User.findOne({
      firebase_uid: uid,
    }).select("_id mobile firebase_uid user_type is_active");

    // Neither identity is associated with an existing account.
    if (!userByMobile && !userByFirebaseUid) {
      return sendSuccess(res, {
        statusCode: 200,
        message: "Continue with customer registration.",
        data: {
          next_step: "REGISTER",
        },
      });
    }

    // The verified mobile and Firebase UID point to different accounts.
    if (
      userByMobile &&
      userByFirebaseUid &&
      userByMobile._id.toString() !== userByFirebaseUid._id.toString()
    ) {
      return sendError(res, {
        statusCode: 409,
        code: "IDENTITY_MISMATCH",
        message:
          "The verified phone number and Firebase identity belong to different accounts.",
      });
    }

    // Prefer the account found through the verified mobile.
    const user = userByMobile || userByFirebaseUid;

    // console.log("user mobile", user.mobile);
    // console.log("user uid", user.firebase_uid);
    // console.log("mobile", mobile);
    // console.log("uid", uid);

    // Require the stored phone number to match the verified phone.
    if (user.mobile !== mobile) {
      return sendError(res, {
        statusCode: 409,
        code: "MOBILE_MISMATCH",
        message:
          "The verified phone number does not match the existing account.",
      });
    }

    // Require the stored Firebase UID to match the verified Firebase UID.
    if (user.firebase_uid !== uid) {
      return sendError(res, {
        statusCode: 409,
        code: "FIREBASE_UID_MISMATCH",
        message:
          "The verified Firebase identity is not linked to this account.",
      });
    }

    if (user.user_type !== "CUSTOMER") {
      return sendError(res, {
        statusCode: 403,
        code: "CUSTOMER_ACCESS_NOT_AVAILABLE",
        message: "Customer access is not available for this account.",
      });
    }

    if (!user.is_active) {
      return sendError(res, {
        statusCode: 403,
        code: "ACCOUNT_INACTIVE",
        message: "This account is currently unavailable.",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Continue with customer login.",
      data: {
        next_step: "LOGIN",
      },
    });
  } catch (error) {
    console.error(
      "Continue after verification failed:",
      error.name,
      error.message,
    );

    return sendError(res, {
      statusCode: 500,
      code: "AUTH_CONTINUE_FAILED",
      message: "Unable to continue. Please try again.",
    });
  }
};
