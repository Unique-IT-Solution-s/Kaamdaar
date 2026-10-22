import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const continueAfterVerification = async (req, res) => {
  try {
    // These values come from the verified Firebase ID token.
    const { uid, mobile } = req.firebaseUser;

    // console.log("Verified Firebase UID:", uid);
    // console.log("Verified mobile:", mobile);

    const user = await User.findOne({
      $or: [{ mobile }, { firebase_uid: uid }],
    }).select("_id mobile firebase_uid user_type is_active");

    // No account exists for this verified mobile.
    if (!user) {
      return sendSuccess(res, {
        statusCode: 200,
        message: "Continue with customer registration.",
        data: {
          next_step: "REGISTER",
        },
      });
    }

    else {
    // Do not silently link an account to another Firebase identity.
    // console.log("user.mobile", user.mobile )
    // console.log("user.mobile", mobile )
    // console.log("user.firebase_uid", user.firebase_uid)
    // console.log("user.firebase_uid", uid)

    if (user.mobile !== mobile || user.firebase_uid !== uid) {
      return sendError(res, {
        statusCode: 409,
        code: "IDENTITY_MISMATCH",
        message:
          "This account cannot be linked to the verified identity. Please contact support.",
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
}
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
