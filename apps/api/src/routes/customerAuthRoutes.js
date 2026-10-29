import express from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { getCustomerProfile, logoutCustomer, registerCustomer, updateCustomerProfile } from "../controllers/customerAuthController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = express.Router();

router.post("/registerCustomer", verifyFirebaseToken, registerCustomer);
router.get("/getCustomerProfile", verifyAccessToken, getCustomerProfile)
router.patch("/updateCustomerProfile", verifyAccessToken, updateCustomerProfile)
router.post("/logoutCustomer", verifyAccessToken, logoutCustomer)

export default router;
