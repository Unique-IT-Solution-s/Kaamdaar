
import "dotenv/config";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

try {
  const app = initializeApp({
    credential: applicationDefault(),
  });

  const auth = getAuth(app);
  const user = await auth.getUserByEmail("dineshjangir@gmail.com");

  console.log("Firebase Admin connected successfully.");
  console.log("Firebase UID:", user.uid);
} catch (error) {
  console.error("Firebase Admin test failed:", error.message);
  process.exitCode = 1;
}
