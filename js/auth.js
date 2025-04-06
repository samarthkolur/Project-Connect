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
const analytics = getAnalytics(app)
const auth = getAuth(app)

// Login form handler
const loginForm = document.getElementById("loginForm")
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const usn = loginForm.usn.value
    const password = loginForm.password.value

    signInWithEmailAndPassword(auth, usn + "@student.edu", password)
      .then((userCredential) => {
        window.location.href = "dashboard.html"
      })
      .catch((error) => {
        alert(error.message)
      })
  })
}

// Signup form handler
const signupForm = document.getElementById("signupForm")
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const usn = signupForm.usn.value
    const email = signupForm.email.value
    const password = signupForm.password.value

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        return updateProfile(userCredential.user, {
          displayName: usn,
        })
      })
      .then(() => {
        window.location.href = "dashboard.html"
      })
      .catch((error) => {
        alert(error.message)
      })
  })
}

