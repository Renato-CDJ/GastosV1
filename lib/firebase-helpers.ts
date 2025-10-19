import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  type QueryConstraint,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { getFirebaseFirestore } from "./firebase"

export const COLLECTIONS = {
  EXPENSES: "expenses",
  BUDGETS: "budgets",
  INSTALLMENTS: "installments",
  SALARIES: "salaries",
  FAMILY_MEMBERS: "familyMembers",
  CATEGORIES: "categories",
} as const

export function timestampToISO(timestamp: any): string {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString()
  }
  return timestamp || new Date().toISOString()
}

export function isoToTimestamp(isoString: string): Timestamp {
  return Timestamp.fromDate(new Date(isoString))
}

export async function addDocument<T>(collectionName: string, data: T): Promise<string> {
  const db = getFirebaseFirestore()
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function updateDocument<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, data as any)
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
}

export async function getDocuments<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
  const db = getFirebaseFirestore()
  const q = query(collection(db, collectionName), ...constraints)
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[]
}

export function subscribeToDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
): Unsubscribe {
  const db = getFirebaseFirestore()
  const q = query(collection(db, collectionName), ...constraints)

  return onSnapshot(
    q,
    (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[]
      callback(data)
    },
    (error) => {
      console.error(`Error in subscription to ${collectionName}:`, error)
    },
  )
}
