"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { CalendarIcon, CheckCircleIcon, ClockIcon, PlusIcon, UsersIcon, MessageSquareIcon } from "lucide-react"

interface UserData {
  usn: string
  fullName: string
  lastLogin?: string
}

interface Activity {
  type: string
  description: string
  timestamp: Date
  projectId?: string
  projectTitle?: string
}

interface Deadline {
  title: string
  dueDate: Date
  projectId?: string
  projectTitle?: string
}

export default function HomePage() {
  const [userData, setUserData] = useState<UserData>({
    usn: "Student",
    fullName: "Student",
  })
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    achievements: 0,
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        const userData = userDoc.data()

        if (userData) {
          setUserData({
            usn: userData.usn || user.displayName || "Student",
            fullName: userData.fullName || userData.usn || "Student",
            lastLogin: new Date().toLocaleString(),
          })
        }

        // Fetch user's projects for stats
        await fetchUserStats(user.uid)

        // Fetch recent activities
        await fetchRecentActivities(user.uid)

        // Fetch upcoming deadlines
        await fetchUpcomingDeadlines(user.uid)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchUserStats = async (userId: string) => {
    try {
      // Get active projects count
      const activeProjectsQuery = query(
        collection(db, "userProjects", userId, "projects"),
        where("status", "!=", "completed"),
      )
      const activeProjectsSnapshot = await getDocs(activeProjectsQuery)
      const activeProjectsCount = activeProjectsSnapshot.size

      // Get completed projects count
      const completedProjectsQuery = query(
        collection(db, "userProjects", userId, "projects"),
        where("status", "==", "completed"),
      )
      const completedProjectsSnapshot = await getDocs(completedProjectsQuery)
      const completedProjectsCount = completedProjectsSnapshot.size

      // Get achievements count (this would depend on your data structure)
      // For now, let's assume achievements are stored in a subcollection
      const achievementsQuery = query(collection(db, "users", userId, "achievements"))
      const achievementsSnapshot = await getDocs(achievementsQuery)
      const achievementsCount = achievementsSnapshot.size

      setStats({
        activeProjects: activeProjectsCount,
        completedProjects: completedProjectsCount,
        achievements: achievementsCount,
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
      // Set default values if there's an error
      setStats({
        activeProjects: 0,
        completedProjects: 0,
        achievements: 0,
      })
    }
  }

  const fetchRecentActivities = async (userId: string) => {
    try {
      // This is a placeholder - in a real app, you'd have an activities collection
      // For now, let's create some sample activities based on projects
      const projectsQuery = query(
        collection(db, "userProjects", userId, "projects"),
        orderBy("createdAt", "desc"),
        limit(3),
      )
      const projectsSnapshot = await getDocs(projectsQuery)

      const recentActivities: Activity[] = []

      projectsSnapshot.forEach((doc) => {
        const project = doc.data()

        // Add project creation as an activity
        recentActivities.push({
          type: "project_created",
          description: `Project "${project.title}" created`,
          timestamp: new Date(project.createdAt.seconds * 1000),
          projectId: doc.id,
          projectTitle: project.title,
        })

        // If the project has pending applications, add them as activities
        if (project.pendingApplications && project.pendingApplications.length > 0) {
          project.pendingApplications.forEach((app: any) => {
            recentActivities.push({
              type: "application_received",
              description: `${app.usn} applied to "${project.title}"`,
              timestamp: new Date(app.appliedAt.seconds * 1000),
              projectId: doc.id,
              projectTitle: project.title,
            })
          })
        }
      })

      // Sort by timestamp (newest first) and limit to 3
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setActivities(recentActivities.slice(0, 3))
    } catch (error) {
      console.error("Error fetching recent activities:", error)
      setActivities([])
    }
  }

  const fetchUpcomingDeadlines = async (userId: string) => {
    try {
      // This is a placeholder - in a real app, you'd have deadlines associated with projects
      // For now, let's create some sample deadlines based on project creation dates
      const projectsQuery = query(
        collection(db, "userProjects", userId, "projects"),
        orderBy("createdAt", "desc"),
        limit(5),
      )
      const projectsSnapshot = await getDocs(projectsQuery)

      const upcomingDeadlines: Deadline[] = []

      projectsSnapshot.forEach((doc) => {
        const project = doc.data()
        const creationDate = new Date(project.createdAt.seconds * 1000)

        // Add a presentation deadline 14 days after creation
        const presentationDate = new Date(creationDate)
        presentationDate.setDate(presentationDate.getDate() + 14)

        upcomingDeadlines.push({
          title: `${project.title} - Project Presentation`,
          dueDate: presentationDate,
          projectId: doc.id,
          projectTitle: project.title,
        })

        // Add a code review deadline 7 days after creation
        const reviewDate = new Date(creationDate)
        reviewDate.setDate(reviewDate.getDate() + 7)

        upcomingDeadlines.push({
          title: `${project.title} - Code Review`,
          dueDate: reviewDate,
          projectId: doc.id,
          projectTitle: project.title,
        })
      })

      // Sort by due date (soonest first) and limit to 2
      upcomingDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      setDeadlines(upcomingDeadlines.slice(0, 2))
    } catch (error) {
      console.error("Error fetching upcoming deadlines:", error)
      setDeadlines([])
    }
  }

  // Helper function to format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.round(diffMs / 1000)
    const diffMins = Math.round(diffSecs / 60)
    const diffHours = Math.round(diffMins / 60)
    const diffDays = Math.round(diffHours / 24)

    if (diffSecs < 60) {
      return "just now"
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Helper function to get days until deadline
  const getDaysUntil = (date: Date) => {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return "Overdue"
    } else if (diffDays === 0) {
      return "Due today"
    } else if (diffDays === 1) {
      return "Due tomorrow"
    } else {
      return `Due in ${diffDays} days`
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="container px-4 py-8 mx-auto">
        <section className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, {userData.fullName}</h1>
          <p className="text-muted-foreground">Last login: {userData.lastLogin}</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Quick Stats */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <UsersIcon className="mr-2 h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Active</h3>
                  <p className="text-3xl font-bold">{stats.activeProjects}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed</h3>
                  <p className="text-3xl font-bold">{stats.completedProjects}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Achievements</h3>
                  <p className="text-3xl font-bold">{stats.achievements}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <ClockIcon className="mr-2 h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  activities.map((activity, index) => (
                    <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                      <p className="line-clamp-1">{activity.description}</p>
                      <small className="text-muted-foreground">{getRelativeTime(activity.timestamp)}</small>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deadlines.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
                ) : (
                  deadlines.map((deadline, index) => (
                    <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                      <h3 className="font-medium line-clamp-1">{deadline.title}</h3>
                      <p className="text-muted-foreground">{getDaysUntil(deadline.dueDate)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <CheckCircleIcon className="mr-2 h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => router.push("/create-project")} className="flex items-center justify-center">
                  <PlusIcon className="mr-1 h-4 w-4" />
                  New Project
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <UsersIcon className="mr-1 h-4 w-4" />
                  Find Mentor
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <CheckCircleIcon className="mr-1 h-4 w-4" />
                  View Tasks
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <MessageSquareIcon className="mr-1 h-4 w-4" />
                  Team Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Your Recent Projects</h2>
          {stats.activeProjects === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium mb-4">No projects yet</h3>
              <p className="text-muted-foreground mb-6">Start creating your first project to collaborate with others</p>
              <Button onClick={() => router.push("/create-project")}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* This would be populated with actual project data */}
              <Card
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push("/projects")}
              >
                <CardHeader>
                  <CardTitle>View All Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">View and manage all your active and completed projects</p>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </div>
    </AuthenticatedLayout>
  )
}

