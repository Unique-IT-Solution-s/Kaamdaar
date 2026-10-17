import express from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { registerCustomer } from "../controllers/customerAuthController.js";

const router = express.Router();

router.post("/register/customer", verifyFirebaseToken, registerCustomer);

export default router;
