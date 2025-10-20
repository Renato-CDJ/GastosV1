"use server"

import { getAdminFirestore } from "@/lib/firebase-admin"
import type { UserPermissions } from "@/lib/types"

export async function updateUserPermissions(userId: string, permissions: UserPermissions) {
  try {
    const db = getAdminFirestore()
    await db.collection("users").doc(userId).update({ permissions })
    return { success: true }
  } catch (error: any) {
    console.error("Error updating user permissions:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  try {
    const db = getAdminFirestore()
    await db.collection("users").doc(userId).update({ role })
    return { success: true }
  } catch (error: any) {
    console.error("Error updating user role:", error)
    return { success: false, error: error.message }
  }
}
