"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Footer } from "@/components/footer"
import { Menu, LogOut, Bell } from "lucide-react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [userUSN, setUserUSN] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
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
          setUserUSN(userData.usn || user.displayName || "Unknown USN")
        }

        // Fetch notifications (pending applications for user's projects)
        await fetchNotifications(user.uid)
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    })

    return () => unsubscribe()
  }, [router])

  // Fetch notifications (pending applications)
  const fetchNotifications = async (userId: string) => {
    try {
      // Get user's projects
      const userProjectsRef = collection(db, "userProjects", userId, "projects")
      const userProjectsSnapshot = await getDocs(userProjectsRef)

      const allNotifications: any[] = []

      // For each project, check if there are pending applications
      for (const projectDoc of userProjectsSnapshot.docs) {
        const projectData = projectDoc.data()

        if (projectData.pendingApplications && projectData.pendingApplications.length > 0) {
          // Add each application as a notification
          projectData.pendingApplications.forEach((app: any) => {
            allNotifications.push({
              id: `${projectDoc.id}-${app.userId}`,
              projectId: projectDoc.id,
              projectTitle: projectData.title,
              applicantUsn: app.usn,
              applicantId: app.userId,
              message: app.message,
              appliedAt: app.appliedAt,
            })
          })
        }
      }

      setNotifications(allNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

  const routes = [
    {
      href: "/home",
      label: "Dashboard",
      active: router.pathname === "/home",
    },
    {
      href: "/profile",
      label: "Profile",
      active: router.pathname === "/profile",
    },
    {
      href: "/projects",
      label: "Projects",
      active: router.pathname === "/projects",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full bg-background">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center">
            <Link href="/home" className="text-2xl font-bold">
              Pro-Con
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    route.active ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />

            {/* Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                      {notifications.length}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No new notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b last:border-0">
                        <p className="font-medium">
                          {notification.applicantUsn} applied to join {notification.projectTitle}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => router.push(`/projects?view=my-projects&project=${notification.projectId}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center space-x-4">
              <span className="text-sm px-3 py-1 border rounded-full">{userUSN}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            {/* Mobile Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No new notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b last:border-0">
                        <p className="font-medium">
                          {notification.applicantUsn} applied to join {notification.projectTitle}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => router.push(`/projects?view=my-projects&project=${notification.projectId}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4 border-b">
                    <span className="text-sm font-medium">{userUSN}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                  <nav className="flex flex-col space-y-4 mt-8">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                          route.active ? "text-foreground font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {route.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  )
}

