"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { PlusIcon, CheckIcon, XIcon } from "lucide-react"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, orderBy } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface Project {
  id: string
  title: string
  description: string
  numberOfMembers: number
  skills: string[]
  workMode: string
  createdAt: any
  usn: string
  visibility: string
  creatorId: string
  pendingApplications?: Application[]
}

interface Application {
  userId: string
  usn: string
  message: string
  status: string
  appliedAt: any
}

export default function ProjectsPage() {
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [globalProjects, setGlobalProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [activeTab, setActiveTab] = useState("my-projects")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        // Load User Projects
        const userProjectsQuery = query(collection(db, "userProjects", user.uid, "projects"))
        const userProjectsSnapshot = await getDocs(userProjectsQuery)

        const userProjectsData: Project[] = []
        userProjectsSnapshot.forEach((doc) => {
          userProjectsData.push({
            id: doc.id,
            ...doc.data(),
          } as Project)
        })
        setUserProjects(userProjectsData)

        // Load Global Projects
        const globalProjectsQuery = query(
          collection(db, "projects"),
          where("visibility", "==", "public"),
          orderBy("createdAt", "desc"),
        )
        const globalProjectsSnapshot = await getDocs(globalProjectsQuery)

        const globalProjectsData: Project[] = []
        globalProjectsSnapshot.forEach((doc) => {
          // Only add projects not created by the current user
          const projectData = doc.data()
          if (projectData.creatorId !== user.uid) {
            globalProjectsData.push({
              id: doc.id,
              ...projectData,
            } as Project)
          }
        })
        setGlobalProjects(globalProjectsData)

        // Check if we need to open a specific project from URL params
        const viewParam = searchParams.get("view")
        const projectParam = searchParams.get("project")

        if (viewParam && projectParam) {
          setActiveTab(viewParam)

          // Find the project
          if (viewParam === "my-projects") {
            const project = userProjectsData.find((p) => p.id === projectParam)
            if (project) {
              setSelectedProject(project)
              setIsModalOpen(true)
            }
          } else {
            const project = globalProjectsData.find((p) => p.id === projectParam)
            if (project) {
              setSelectedProject(project)
              setIsModalOpen(true)
            }
          }
        }
      } catch (error) {
        console.error("Error loading projects:", error)
      }
    })

    return () => unsubscribe()
  }, [router, searchParams])

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleApplyToProject = async () => {
    if (!selectedProject || !auth.currentUser) return

    try {
      const applicationData = {
        userId: auth.currentUser.uid,
        usn: auth.currentUser.displayName,
        message: applicationMessage,
        status: "pending",
        appliedAt: new Date(),
      }

      // Add to the project's pendingApplications array
      const projectRef = doc(db, "projects", selectedProject.id)
      await updateDoc(projectRef, {
        pendingApplications: arrayUnion(applicationData),
      })

      // Also add to the creator's project document
      const creatorProjectRef = doc(db, "userProjects", selectedProject.creatorId, "projects", selectedProject.id)
      await updateDoc(creatorProjectRef, {
        pendingApplications: arrayUnion(applicationData),
      })

      alert("Application submitted successfully!")
      setApplicationMessage("")
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error submitting application:", error)
      alert("Failed to submit application")
    }
  }

  const handleApproveApplication = async (application: Application) => {
    if (!selectedProject || !auth.currentUser) return

    try {
      // Remove from pending applications
      const projectRef = doc(db, "userProjects", auth.currentUser.uid, "projects", selectedProject.id)

      // Update the project document
      await updateDoc(projectRef, {
        pendingApplications: arrayRemove(application),
        approvedMembers: arrayUnion(application.userId),
      })

      // Also update the global project document
      const globalProjectRef = doc(db, "projects", selectedProject.id)
      await updateDoc(globalProjectRef, {
        pendingApplications: arrayRemove(application),
        approvedMembers: arrayUnion(application.userId),
      })

      alert("Application approved!")

      // Update the local state
      const updatedProject = { ...selectedProject }
      updatedProject.pendingApplications =
        updatedProject.pendingApplications?.filter((app) => app.userId !== application.userId) || []

      setSelectedProject(updatedProject)

      // Refresh projects list
      const userProjectsQuery = query(collection(db, "userProjects", auth.currentUser.uid, "projects"))
      const userProjectsSnapshot = await getDocs(userProjectsQuery)

      const userProjectsData: Project[] = []
      userProjectsSnapshot.forEach((doc) => {
        userProjectsData.push({
          id: doc.id,
          ...doc.data(),
        } as Project)
      })
      setUserProjects(userProjectsData)
    } catch (error) {
      console.error("Error approving application:", error)
      alert("Failed to approve application")
    }
  }

  const handleRejectApplication = async (application: Application) => {
    if (!selectedProject || !auth.currentUser) return

    try {
      // Remove from pending applications
      const projectRef = doc(db, "userProjects", auth.currentUser.uid, "projects", selectedProject.id)

      await updateDoc(projectRef, {
        pendingApplications: arrayRemove(application),
      })

      // Also update the global project document
      const globalProjectRef = doc(db, "projects", selectedProject.id)
      await updateDoc(globalProjectRef, {
        pendingApplications: arrayRemove(application),
      })

      alert("Application rejected")

      // Update the local state
      const updatedProject = { ...selectedProject }
      updatedProject.pendingApplications =
        updatedProject.pendingApplications?.filter((app) => app.userId !== application.userId) || []

      setSelectedProject(updatedProject)

      // Refresh projects list
      const userProjectsQuery = query(collection(db, "userProjects", auth.currentUser.uid, "projects"))
      const userProjectsSnapshot = await getDocs(userProjectsQuery)

      const userProjectsData: Project[] = []
      userProjectsSnapshot.forEach((doc) => {
        userProjectsData.push({
          id: doc.id,
          ...doc.data(),
        } as Project)
      })
      setUserProjects(userProjectsData)
    } catch (error) {
      console.error("Error rejecting application:", error)
      alert("Failed to reject application")
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Button onClick={() => router.push("/create-project")}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="global-projects">Global Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects">
            {userProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven&apos;t created any projects yet.</p>
                <Button onClick={() => router.push("/create-project")}>Create Your First Project</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-center py-1 px-2 rounded-full text-xs mb-2 w-fit">
                        Your Project
                      </div>
                      <CardTitle>{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 mb-4">{project.description}</p>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between mb-1">
                          <span>Members:</span>
                          <span>{(project.numberOfMembers || 0) + 1}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Work Mode:</span>
                          <span>{project.workMode || "Not Specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>
                            {project.createdAt
                              ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                      {project.pendingApplications && project.pendingApplications.length > 0 && (
                        <div className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md text-sm">
                          {project.pendingApplications.length} pending application(s)
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => handleProjectClick(project)}>
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="global-projects">
            {globalProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No public projects available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {globalProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 mb-4">{project.description}</p>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between mb-1">
                          <span>Creator:</span>
                          <span>{project.usn || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Members:</span>
                          <span>{(project.numberOfMembers || 0) + 1}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Work Mode:</span>
                          <span>{project.workMode || "Not Specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>
                            {project.createdAt
                              ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => handleProjectClick(project)}>
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Project Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedProject?.title}</DialogTitle>
              <DialogDescription>{selectedProject?.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Work Mode:</div>
                  <div className="font-medium">{selectedProject?.workMode}</div>

                  <div>Members:</div>
                  <div className="font-medium">{selectedProject ? (selectedProject.numberOfMembers || 0) + 1 : 0}</div>

                  <div>Creator:</div>
                  <div className="font-medium">{selectedProject?.usn}</div>

                  <div>Created:</div>
                  <div className="font-medium">
                    {selectedProject?.createdAt
                      ? new Date(selectedProject.createdAt.seconds * 1000).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </div>
              </div>

              {selectedProject?.skills && selectedProject.skills.length > 0 && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium mb-2">Required Skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map((skill, index) => (
                      <span key={index} className="bg-primary/10 px-2 py-1 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Show pending applications for user's own projects */}
              {selectedProject && auth.currentUser && selectedProject.creatorId === auth.currentUser.uid && (
                <div className="space-y-3">
                  <h3 className="font-medium">Pending Applications</h3>
                  {!selectedProject.pendingApplications || selectedProject.pendingApplications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending applications</p>
                  ) : (
                    selectedProject.pendingApplications.map((application, index) => (
                      <div key={index} className="border p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{application.usn}</p>
                            <p className="text-sm text-muted-foreground mt-1">{application.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied:{" "}
                              {application.appliedAt
                                ? new Date(application.appliedAt.seconds * 1000).toLocaleDateString()
                                : "Unknown"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => handleApproveApplication(application)}
                            >
                              <CheckIcon className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => handleRejectApplication(application)}
                            >
                              <XIcon className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Application form for global projects */}
              {selectedProject && auth.currentUser && selectedProject.creatorId !== auth.currentUser.uid && (
                <div className="space-y-2">
                  <Label htmlFor="applicationMessage">Apply to join this project:</Label>
                  <Textarea
                    id="applicationMessage"
                    placeholder="Write a brief message about why you want to join this project"
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              {selectedProject && auth.currentUser && selectedProject.creatorId !== auth.currentUser.uid ? (
                <Button onClick={handleApplyToProject} disabled={!applicationMessage.trim()}>
                  Submit Application
                </Button>
              ) : (
                <Button onClick={() => setIsModalOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  )
}

