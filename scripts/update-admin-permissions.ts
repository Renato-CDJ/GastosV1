// Script to update admin user permissions in Firestore
import { getFirebaseAuth, getFirebaseFirestore } from "../lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

async function updateAdminPermissions() {
  try {
    const auth = getFirebaseAuth()
    const db = getFirebaseFirestore()

    const email = "renato.calixto@email.com"
    const password = "rp2129"

    console.log("Signing in to get user ID...")

    // Sign in to get the user ID
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log("User ID:", user.uid)
    console.log("Updating user permissions in Firestore...")

    // Check if user document exists
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      console.log("Current user data:", userDoc.data())
    }

    // Update user document with admin role and family access
    await setDoc(
      userDocRef,
      {
        displayName: user.displayName || "Renato Calixto",
        email: user.email,
        role: "admin",
        hasFamilyAccess: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )

    console.log("✅ Admin permissions updated successfully!")
    console.log("User now has:")
    console.log("  - Role: admin")
    console.log("  - Family Access: true")
    console.log("\nPlease refresh your browser to see the changes.")
  } catch (error: any) {
    console.error("❌ Error updating admin permissions:", error)
    if (error.code === "auth/wrong-password") {
      console.log("Incorrect password. Please check your credentials.")
    } else if (error.code === "auth/user-not-found") {
      console.log("User not found. Please run create-admin-user.ts first.")
    }
  }
}

updateAdminPermissions()
