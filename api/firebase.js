// api/firebase.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Path to your actual JSON file (NOT firebase.js)
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "./web-project-11a59-firebase-adminsdk-fbsvc-3871f5a4c2.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
