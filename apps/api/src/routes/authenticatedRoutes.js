
import express from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { sendSuccess } from "../utils/apiResponse.js";

const router = express.Router();

router.get("/me", verifyFirebaseToken, (req, res) => {
  return sendSuccess(res, {
    message: "Firebase token verified successfully.",
    data: {
      firebase_uid: req.firebaseUser.uid,
      mobile: req.firebaseUser.mobile,
    },
  });
});

export default router;
