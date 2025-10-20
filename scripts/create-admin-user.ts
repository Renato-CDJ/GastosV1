// Script to create the admin user
import { getFirebaseAuth, getFirebaseFirestore } from "../lib/firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

async function createAdminUser() {
  try {
    const auth = getFirebaseAuth()
    const db = getFirebaseFirestore()

    const email = "renato.calixto@email.com"
    const password = "rp2129"
    const displayName = "Renato Calixto"

    console.log("Creating admin user...")

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    await updateProfile(user, { displayName })

    // Save user data to Firestore with admin role
    await setDoc(doc(db, "users", user.uid), {
      displayName,
      email,
      role: "admin",
      hasFamilyAccess: true,
      createdAt: new Date().toISOString(),
    })

    console.log("✅ Admin user created successfully!")
    console.log("Email:", email)
    console.log("User ID:", user.uid)
    console.log("Role: admin")
    console.log("Family Access: true")
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.log("⚠️  User already exists in Firebase Auth.")
      console.log("Please run 'update-admin-permissions.ts' to update the user's role and permissions.")
    } else {
      console.error("❌ Error creating admin user:", error)
    }
  }
}

createAdminUser()
