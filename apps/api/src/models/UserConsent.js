import mongoose from "mongoose";

const userConsentSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    consent_type: {
      type: String,
      enum: ["TERMS", "PRIVACY"],
      required: true,
    },

    policy_version: {
      type: String,
      required: true,
      trim: true,
    },

    accepted_at: {
      type: Date,
      required: true,
      default: Date.now,
    },

    source: {
      type: String,
      enum: ["WEB", "MOBILE_APP"],
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "user_consents",
}
)

userConsentSchema.index(
  { user_id: 1, consent_type: 1, policy_version: 1 },
  { unique: true }
);

const UserConsent = mongoose.model("UserConsent", userConsentSchema);

export default UserConsent;