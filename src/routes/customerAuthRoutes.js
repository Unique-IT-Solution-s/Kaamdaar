import express from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { getCustomerProfile, registerCustomer } from "../controllers/customerAuthController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = express.Router();

router.post("/register/customer", verifyFirebaseToken, registerCustomer);
router.get("/getCustomerProfile", verifyAccessToken, getCustomerProfile)

export default router;
