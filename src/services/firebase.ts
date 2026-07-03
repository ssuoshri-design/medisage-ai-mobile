import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

export async function initializeFirebaseService() {
  if (firebaseApp) return { app: firebaseApp, auth: firebaseAuth!, db: firebaseDb! };

  try {
    const response = await fetch("/api/config");
    const data = await response.json();
    const config = data.firebaseConfig;

    if (!config || !config.apiKey) {
      throw new Error("Firebase config is missing or invalid");
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
      firebaseAuth = getAuth(firebaseApp);
      firebaseDb = getFirestore(firebaseApp);
    } else {
      firebaseApp = getApp();
      firebaseAuth = getAuth(firebaseApp);
      firebaseDb = getFirestore(firebaseApp);
    }

    console.log("Firebase Service initialized successfully on client");
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
  } catch (error) {
    console.error("Failed to initialize Firebase Client SDK:", error);
    // Return empty / mocked handlers or raise error
    throw error;
  }
}

export function getFirebaseService() {
  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb
  };
}
