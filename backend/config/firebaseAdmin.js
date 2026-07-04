const admin = require("firebase-admin");

let firebaseApp;

const getPrivateKey = () => {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
};

const initializeFirebaseAdmin = () => {
  if (firebaseApp) return firebaseApp;

  if (admin.apps.length) {
    firebaseApp = admin.app();
    return firebaseApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return firebaseApp;
};

const getFirebaseAdmin = () => {
  initializeFirebaseAdmin();
  return admin;
};

module.exports = { getFirebaseAdmin };
