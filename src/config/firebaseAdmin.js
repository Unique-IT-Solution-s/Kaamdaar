import "dotenv/config";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseApp = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credential: applicationDefault(),
});

export const adminAuth = getAuth(firebaseApp);

// console.log(
//   "Backend Firebase project ID:",
//   firebaseApp.options.projectId || "Not explicitly configured"
// );