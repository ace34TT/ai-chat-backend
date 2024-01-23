import * as admin from "firebase-admin";
require("dotenv").config();

const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY || "");

const firebase = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

export { firebase };
