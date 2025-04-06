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
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [usn, setUsn] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Send verification email
      await sendEmailVerification(user)

      // Update profile with USN
      await updateProfile(user, {
        displayName: usn,
      })

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        usn: usn,
        email: email,
        fullName: fullName,
        createdAt: new Date().toISOString(),
        isVerified: false,
      })

      // Show success message and redirect
      alert("Account created! Please check your email for verification.")
      router.push("/login")
    } catch (error: any) {
      setError(error.message)
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Project Connect</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

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
              <Label htmlFor="email">College Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your college email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Use your college email address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

