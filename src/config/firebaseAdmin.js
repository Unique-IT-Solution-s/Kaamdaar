
import "dotenv/config";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseApp = initializeApp({
  credential: applicationDefault(),
});

export const adminAuth = getAuth(firebaseApp);
