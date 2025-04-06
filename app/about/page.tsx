import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl font-bold mb-6 text-center md:text-left">Welcome to Project Connect</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                The ultimate platform for university students to bring ideas to life and collaborate with like-minded
                peers. Our mission is to foster a community of innovation and teamwork. At Project Connect, students can
                share their project ideas, find teammates with the skills needed to turn those ideas into reality, and
                work together to create meaningful projects. By connecting students with resources and opportunities, we
                aim to empower the next generation of innovators and problem-solvers.
              </p>
              <p>
                Soon, we will introduce a research library for resources and past project reports, AI tools for
                efficient scheduling, mentorship support from experts, a leveling system to reward project creators, and
                internship opportunities with partner companies based on individual achievements.
              </p>
              <p>
                Join Project Connect and transform your ideas into impactful projects while unlocking exciting career
                opportunities.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

