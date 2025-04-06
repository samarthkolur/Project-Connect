import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCPyjadBJyq7-a6dafrTeqXsAX9CaW0wIg",
  authDomain: "jecthub-8bfbe.firebaseapp.com",
  projectId: "jecthub-8bfbe",
  storageBucket: "jecthub-8bfbe.firebasestorage.app",
  messagingSenderId: "732606193362",
  appId: "1:732606193362:web:a092e1c6c0727d8739570b",
  measurementId: "G-BDCJTL5W8C",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Function to save user changes
async function saveChanges() {
  console.log("Save button clicked") // Debugging line
  const userId = auth.currentUser.uid // Get the current user's ID
  const userDocRef = doc(db, "users", userId) // Reference to the user's document

  // Gather user data to save
  const userData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    program: document.getElementById("program").value,
    year: Number.parseInt(document.getElementById("year").value), // Ensure year is an integer
  }

  try {
    // Save changes to Firestore
    await setDoc(userDocRef, userData, { merge: true }) // Merge to update existing fields or create new ones
    console.log("User data saved successfully")

    // Disable inputs and hide buttons after saving
    toggleEditMode() // Call toggleEditMode to exit edit mode
  } catch (error) {
    console.error("Error saving user data:", error)
  }
}

// Function to cancel editing
function cancelEdit() {
  console.log("Cancel button clicked") // Debugging line
  // Reset fields to original values if needed
  loadUserDetails() // Reload user details to reset fields
  toggleEditMode() // Call toggleEditMode to exit edit mode
}

// Function to toggle edit mode
function toggleEditMode() {
  const details = document.querySelectorAll(".detail input")
  const saveButton = document.getElementById("saveButton")
  const cancelButton = document.getElementById("cancelButton")
  const editButton = document.getElementById("editButton")
  const isEditing = details[0].disabled // Check if currently in edit mode

  details.forEach((input) => {
    input.disabled = !isEditing // Toggle disabled state
  })

  // Show or hide buttons based on the current state
  saveButton.style.display = isEditing ? "inline-block" : "none" // Show save button
  cancelButton.style.display = isEditing ? "inline-block" : "none" // Show cancel button
  editButton.style.display = isEditing ? "none" : "inline-block" // Hide edit button
}

// Function to load user details
async function loadUserDetails() {
  const userId = auth.currentUser.uid // Get the current user's ID
  const userDocRef = doc(db, "users", userId) // Reference to the user's document

  try {
    const userDoc = await getDoc(userDocRef)
    if (userDoc.exists()) {
      const userData = userDoc.data()
      document.getElementById("fullName").value = userData.fullName || "nil"
      document.getElementById("email").value = userData.email || "nil"
      document.getElementById("phone").value = userData.phone || "nil"
      document.getElementById("address").value = userData.address || "nil"
      document.getElementById("program").value = userData.program || "nil"
      document.getElementById("year").value = userData.year || "nil"
    } else {
      // If no user data, create a new document with default values
      const defaultUserData = {
        fullName: "nil",
        email: "nil",
        phone: "nil",
        address: "nil",
        program: "nil",
        year: 1, // Default year
      }
      await setDoc(userDocRef, defaultUserData) // Create the document
      console.log("New user document created with default values.")

      // Set the input fields to default values
      document.getElementById("fullName").value = defaultUserData.fullName
      document.getElementById("email").value = defaultUserData.email
      document.getElementById("phone").value = defaultUserData.phone
      document.getElementById("address").value = defaultUserData.address
      document.getElementById("program").value = defaultUserData.program
      document.getElementById("year").value = defaultUserData.year
    }
  } catch (error) {
    console.error("Error loading user data:", error)
  }
}

// Call loadUserDetails when the document is ready
document.addEventListener("DOMContentLoaded", loadUserDetails)

