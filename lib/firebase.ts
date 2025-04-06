import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPyjadBJyq7-a6dafrTeqXsAX9CaW0wIg",
  authDomain: "jecthub-8bfbe.firebaseapp.com",
  projectId: "jecthub-8bfbe",
  storageBucket: "jecthub-8bfbe.firebasestorage.app",
  messagingSenderId: "732606193362",
  appId: "1:732606193362:web:a092e1c6c0727d8739570b",
  measurementId: "G-BDCJTL5W8C",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

