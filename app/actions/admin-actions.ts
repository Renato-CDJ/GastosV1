"use server"

import { getFirebaseFirestore } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import type { UserPermissions } from "@/lib/types"

export async function updateUserPermissionsAction(userId: string, permissions: UserPermissions) {
  try {
    // Note: This still uses client SDK but from server
    // For production, you should use Firebase Admin SDK
    const db = getFirebaseFirestore()
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, { permissions })

    return { success: true }
  } catch (error: any) {
    console.error("Error updating user permissions:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserRoleAction(userId: string, role: "admin" | "user") {
  try {
    const db = getFirebaseFirestore()
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, { role })

    return { success: true }
  } catch (error: any) {
    console.error("Error updating user role:", error)
    return { success: false, error: error.message }
  }
}
