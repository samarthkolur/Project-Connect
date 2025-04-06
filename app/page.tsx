import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to Project Connect
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 opacity-90 animate-fade-in-delay-1">
              Your gateway to collaborative learning and project success. Connect with mentors, showcase your skills,
              and build your future.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-delay-2">
              <Button asChild size="lg">
                <Link href="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Authentication",
                  description: "Secure access using university credentials with your unique ID or email.",
                },
                {
                  title: "Project Dashboard",
                  description: "Track tasks, deadlines, and milestones in one central location.",
                },
                {
                  title: "Mentor Connect",
                  description: "Get guidance from experienced mentors in your field of interest.",
                },
                {
                  title: "Task Management",
                  description: "Organize your work with Kanban boards and priority settings.",
                },
                {
                  title: "Achievement System",
                  description: "Earn badges and climb leaderboards as you complete projects.",
                },
                {
                  title: "Career Growth",
                  description: "Get matched with internships based on your project portfolio.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border"
                >
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students already collaborating on innovative projects.
            </p>
            <Button asChild size="lg">
              <Link href="/login">Join Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

