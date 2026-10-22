import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import CustomerProfile from "../models/CustomerProfile.js";
import UserConsent from "../models/UserConsent.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import UserSession from "../models/UserSession.js";

const TERMS_POLICY_VERSION = "v1";
const PRIVACY_POLICY_VERSION = "v1";

export const registerCustomer = async (req, res) => {
  const { uid, mobile } = req.firebaseUser;

  const { name, email, acceptedTerms, acceptedPrivacy } = req.body;

  // Validate customer-provided details.
  const fields = {};

  if (typeof name !== "string" || name.trim().length < 2) {
    fields.name = "Enter your full name.";
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    fields.email = "Enter a valid email address.";
  }

  if (acceptedTerms !== true) {
    fields.acceptedTerms = "You must accept the Terms of Use.";
  }

  if (acceptedPrivacy !== true) {
    fields.acceptedPrivacy = "You must acknowledge the Privacy Policy.";
  }

  if (Object.keys(fields).length > 0) {
    return sendError(res, {
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Please correct the registration details.",
      fields,
    });
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET;

  if (!accessSecret) {
    return sendError(res, {
      statusCode: 500,
      code: "AUTH_CONFIGURATION_ERROR",
      message: "Authentication is not configured.",
    });
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const session = await mongoose.startSession();

  try {
    let registeredUser;
    let accessToken;

    const refreshToken = randomBytes(48).toString("hex");

    const refreshTokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await session.withTransaction(async () => {
      // Check whether this Firebase identity or mobile already exists.
      const existingUser = await User.findOne({
        $or: [{ firebase_uid: uid }, { mobile }],
      }).session(session);

      if (existingUser) {
        const error = new Error("An account may already exist.");
        error.code = "ACCOUNT_ALREADY_EXISTS";
        throw error;
      }

      // Find the pre-seeded CUSTOMER role.
      const customerRole = await Role.findOne({
        role_name: "CUSTOMER",
      }).session(session);

      if (!customerRole) {
        const error = new Error("Customer role is not configured.");
        error.code = "CUSTOMER_ROLE_NOT_CONFIGURED";
        throw error;
      }

      // Create the user using Firebase's verified identity.
      const [user] = await User.create(
        [
          {
            name: normalizedName,
            email: normalizedEmail,
            mobile,
            firebase_uid: uid,
            role_id: customerRole._id,
            user_type: "CUSTOMER",
            mobile_verified: true,
            email_verified: false,
            is_active: true,
          },
        ],
        { session },
      );

      //   console.log("user : ", user)

      // Create the associated customer profile.
      await CustomerProfile.create(
        [
          {
            userId: user._id,
          },
        ],
        { session },
      );

      // Record the customer's explicit policy acknowledgements.
      await UserConsent.create(
        [
          {
            user_id: user._id,
            consent_type: "TERMS",
            policy_version: TERMS_POLICY_VERSION,
            accepted_at: new Date(),
            source: "WEB",
          },
          {
            user_id: user._id,
            consent_type: "PRIVACY",
            policy_version: PRIVACY_POLICY_VERSION,
            accepted_at: new Date(),
            source: "WEB",
          },
        ],
        {
          session,
          ordered: true,
        },
      );

      const [userSession] = await UserSession.create(
        [
          {
            user_id: user._id,
            refresh_token_hash: refreshTokenHash,
            device_name:
              typeof req.body?.deviceName === "string"
                ? req.body.deviceName.trim().slice(0, 100)
                : "Web Browser",
            platform: "WEB",
            expires_at: refreshExpiresAt,
            last_used_at: new Date(),
          },
        ],
        { session },
      );

      accessToken = jwt.sign(
        {
          sub: user._id.toString(),
          role: "CUSTOMER",
          sessionId: userSession._id.toString(),
        },
        accessSecret,
        { expiresIn: "15m" },
      );

      registeredUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: "CUSTOMER",
      };
    });

    res.cookie("kaamdaar_refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Customer registered successfully.",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: 900,
        customer: registeredUser,
        next_step: "ADD_ADDRESS_OR_HOME",
      },
    });
  } catch (error) {
    console.error("Customer registration error details:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Stack:", error.stack);

    if (error.code === "ACCOUNT_ALREADY_EXISTS" || error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        code: "ACCOUNT_ALREADY_EXISTS",
        message:
          "An account may already exist for these details. Please continue with login.",
      });
    }

    if (error.code === "CUSTOMER_ROLE_NOT_CONFIGURED") {
      return sendError(res, {
        statusCode: 500,
        code: "CUSTOMER_ROLE_NOT_CONFIGURED",
        message: "Customer registration is not configured.",
      });
    }

    console.error("Customer registration failed:", error.code || error.name);

    return sendError(res, {
      statusCode: 500,
      code: "REGISTRATION_FAILED",
      message: "Unable to complete registration. Please try again.",
    });
  } finally {
    await session.endSession();
  }
};
