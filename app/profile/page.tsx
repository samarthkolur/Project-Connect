"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface UserData {
  fullName: string
  email: string
  phone: string
  address: string
  program: string
  year: number
  usn: string
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData>({
    fullName: "nil",
    email: "nil",
    phone: "nil",
    address: "nil",
    program: "nil",
    year: 1,
    usn: "nil",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData
          setUserData({
            fullName: data.fullName || "nil",
            email: data.email || "nil",
            phone: data.phone || "nil",
            address: data.address || "nil",
            program: data.program || "nil",
            year: data.year || 1,
            usn: data.usn || "nil",
          })
        } else {
          // If no user data, create a new document with default values
          const defaultUserData = {
            fullName: "nil",
            email: "nil",
            phone: "nil",
            address: "nil",
            program: "nil",
            year: 1,
            usn: user.displayName || "nil",
          }
          await setDoc(userDocRef, defaultUserData)
          setUserData(defaultUserData)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: name === "year" ? Number.parseInt(value) : value,
    }))
  }

  const handleSave = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("No authenticated user found")
      }

      const userDocRef = doc(db, "users", auth.currentUser.uid)
      await setDoc(userDocRef, userData, { merge: true })

      setMessage({ text: "Profile updated successfully!", type: "success" })
      setIsEditing(false)

      setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 3000)
    } catch (error: any) {
      console.error("Error saving user data:", error)
      setMessage({ text: `Error saving data: ${error.message}`, type: "error" })
    }
  }

  const handleCancel = () => {
    // Reload user details to reset fields
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid)
      getDoc(userDocRef).then((doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData
          setUserData({
            fullName: data.fullName || "nil",
            email: data.email || "nil",
            phone: data.phone || "nil",
            address: data.address || "nil",
            program: data.program || "nil",
            year: data.year || 1,
            usn: data.usn || "nil",
          })
        }
      })
    }
    setIsEditing(false)
    setMessage({ text: "", type: "" })
  }

  return (
    <AuthenticatedLayout>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card className="text-center p-6">
              <div className="mb-4">
                <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold">{userData.fullName.charAt(0)}</span>
                </div>
                <h2 className="text-xl font-bold">{userData.fullName}</h2>
                <p className="text-muted-foreground">Student ID: {userData.usn}</p>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)} className="w-full" disabled={isEditing}>
                Edit Profile
              </Button>
            </Card>
          </div>

          <div className="md:w-2/3">
            <Card>
              <CardContent className="p-6">
                {message.text && (
                  <div
                    className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">
                      Full Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={userData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">
                      Email Address<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      Phone Number<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="program">
                      Program/Department<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="program"
                      name="program"
                      value={userData.program}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="year">
                      Year of Study<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      min="1"
                      max="4"
                      value={userData.year}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button onClick={handleSave}>Save</Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

