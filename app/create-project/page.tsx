"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { PlusIcon, MinusIcon } from "lucide-react"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function CreateProjectPage() {
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [numberOfMembers, setNumberOfMembers] = useState(1)
  const [skills, setSkills] = useState<string[]>([""])
  const [workMode, setWorkMode] = useState("online")
  const [error, setError] = useState("")
  const router = useRouter()

  const addSkillField = () => {
    setSkills([...skills, ""])
  }

  const removeSkillField = (index: number) => {
    const newSkills = [...skills]
    newSkills.splice(index, 1)
    setSkills(newSkills)
  }

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills]
    newSkills[index] = value
    setSkills(newSkills)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!auth.currentUser) {
      setError("You must be logged in to create a project")
      return
    }

    try {
      const filteredSkills = skills.filter((skill) => skill.trim() !== "")

      const projectData = {
        title: projectTitle,
        description: projectDescription,
        numberOfMembers: Number.parseInt(numberOfMembers.toString()) - 1, // Exclude the user
        skills: filteredSkills,
        workMode,
        createdAt: new Date(),
        visibility: "public",
        usn: auth.currentUser.displayName || "Unknown USN",
        creatorId: auth.currentUser.uid,
      }

      // Save to user-specific collection
      const userProjectRef = doc(db, "userProjects", auth.currentUser.uid, "projects", projectTitle)
      await setDoc(userProjectRef, projectData)

      // Save to global projects collection
      const globalProjectRef = doc(db, "projects", projectTitle)
      await setDoc(globalProjectRef, projectData)

      alert("Project created successfully!")
      router.push("/projects")
    } catch (error: any) {
      console.error("Project creation error:", error)
      setError(error.message || "Failed to create project")
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="container px-4 py-8 mx-auto">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  required
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfMembers">Number of Members</Label>
                <Input
                  id="numberOfMembers"
                  type="number"
                  min="1"
                  value={numberOfMembers}
                  onChange={(e) => setNumberOfMembers(Number.parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Skills Needed</Label>
                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        placeholder={`Enter ${index === 0 ? "a" : "another"} skill`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkillField(index)}
                        disabled={skills.length === 1}
                      >
                        <MinusIcon className="h-4 w-4" />
                        <span className="sr-only">Remove skill</span>
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSkillField} className="mt-2">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Work Mode</Label>
                <RadioGroup value={workMode} onValueChange={setWorkMode} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">Online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="offline" id="offline" />
                    <Label htmlFor="offline">Offline</Label>
                  </div>
                </RadioGroup>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit">Submit</Button>
                <Button type="reset" variant="outline">
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}

