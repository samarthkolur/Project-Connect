"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { EyeIcon, EyeOffIcon } from "lucide-react"

export default function LoginPage() {
  const [usn, setUsn] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleUsnInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase()

    // Force 'ENG' at the start
    if (value.length <= 3) {
      value = "ENG".substring(0, value.length)
    }

    // Restrict next 2 characters to numbers
    if (value.length > 3 && value.length <= 5) {
      value = "ENG" + value.slice(3).replace(/[^0-9]/g, "")
    }

    // Restrict next 2 characters to letters
    if (value.length > 5 && value.length <= 7) {
      value = value.slice(0, 5) + value.slice(5).replace(/[^A-Z]/g, "")
    }

    // Restrict last 4 characters to numbers
    if (value.length > 7) {
      value = value.slice(0, 7) + value.slice(7).replace(/[^0-9]/g, "")
    }

    // Limit to maximum length
    value = value.slice(0, 11)

    setUsn(value)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // First, query Firestore to get the email associated with the USN
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("usn", "==", usn))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError("USN not found")
        return
      }

      const userDoc = querySnapshot.docs[0]
      const email = userDoc.data().email

      // Now sign in with the email
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Force refresh the user's token
      await userCredential.user.reload()

      // Check if email is verified after reload
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in")
        return
      }

      // Update verification status in Firestore
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          isVerified: true,
        },
        { merge: true },
      )

      // Successful login
      router.push("/home")
    } catch (error: any) {
      switch (error.code) {
        case "auth/wrong-password":
          setError("Incorrect password")
          break
        case "auth/user-not-found":
          setError("Account not found")
          break
        default:
          setError(error.message)
      }
    }
  }

  const handleResendVerification = async () => {
    try {
      // First, query Firestore to get the email associated with the USN
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("usn", "==", usn))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError("USN not found")
        return
      }

      const userDoc = querySnapshot.docs[0]
      const email = userDoc.data().email

      // Sign in to get the user object
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Send verification email
      await sendEmailVerification(userCredential.user)

      setError("Verification email sent! Please check your inbox.")
    } catch (error: any) {
      setError("Error sending verification email. Please try again later.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Link href="/" className="absolute top-4 left-4">
        <Button variant="ghost" size="icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="sr-only">Back to home</span>
        </Button>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold inline-block mb-2">
            Pro-Con
          </Link>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usn">University ID (USN)</Label>
              <Input
                id="usn"
                placeholder="Enter your USN"
                value={usn}
                onChange={handleUsnInput}
                pattern="ENG[0-9]{2}[A-Z]{2}[0-9]{4}"
                title="Format: ENG23CS0001"
                required
              />
              <p className="text-xs text-muted-foreground">Format: ENG23CS0001</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {error.includes("verify your email") && (
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal underline ml-2"
                      onClick={handleResendVerification}
                    >
                      Resend verification email
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

