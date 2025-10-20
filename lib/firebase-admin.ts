// Firebase Admin SDK for server-side operations
// This file should only be imported in Server Actions or API routes

import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminApp: App | null = null
let adminDb: Firestore | null = null

export function getAdminApp(): App {
  if (adminApp) {
    return adminApp
  }

  // Check if already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    adminApp = existingApps[0]
    return adminApp
  }

  // For development: use application default credentials or service account
  // In production, set GOOGLE_APPLICATION_CREDENTIALS environment variable
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "gastos-e6367",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error)
    // Fallback: initialize without credentials (will use application default)
    adminApp = initializeApp()
  }

  return adminApp
}

export function getAdminFirestore(): Firestore {
  if (adminDb) {
    return adminDb
  }

  const app = getAdminApp()
  adminDb = getFirestore(app)
  return adminDb
}
