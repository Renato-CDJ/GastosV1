import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAnalytics, type Analytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDzGBQXJpL-H323kqt8FLsuhoY_cKOCYvc",
  authDomain: "gastos-e6367.firebaseapp.com",
  projectId: "gastos-e6367",
  storageBucket: "gastos-e6367.firebasestorage.app",
  messagingSenderId: "615059306755",
  appId: "1:615059306755:web:cd13e3989c219aa17a5136",
  measurementId: "G-65VS6R7RK9",
}

// Initialize Firebase app (singleton pattern handled by Firebase SDK)
function initializeFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side")
  }

  // Firebase SDK handles singleton internally
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig)
  }

  return getApp()
}

// Get Auth instance - Firebase SDK handles singleton internally
export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be used on the client side")
  }

  const app = initializeFirebaseApp()
  return getAuth(app)
}

// Get Firestore instance - Firebase SDK handles singleton internally
export function getFirebaseFirestore(): Firestore {
  if (typeof window === "undefined") {
    throw new Error("Firestore can only be used on the client side")
  }

  const app = initializeFirebaseApp()
  return getFirestore(app)
}

// Get Analytics instance (client-side only)
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const app = initializeFirebaseApp()
    const { isSupported } = await import("firebase/analytics")
    const supported = await isSupported()

    if (supported) {
      return getAnalytics(app)
    }
  } catch (error) {
    console.error("Analytics initialization failed:", error)
  }

  return null
}

// Export app initializer for direct use if needed
export const getFirebaseApp = initializeFirebaseApp

export const db = getFirebaseFirestore()
