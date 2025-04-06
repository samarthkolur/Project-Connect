import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Samarth D Kolur",
      role: "Student, Dayananda Sagar University",
    },
    {
      name: "Mithun Krishnan",
      role: "Student, Dayananda Sagar University",
    },
    {
      name: "Pujith R Pulipati",
      role: "Student, Dayananda Sagar University",
    },
    {
      name: "Manjoy C",
      role: "Student, Dayananda Sagar University",
    },
    {
      name: "Shivam Parashar",
      role: "Student, Dayananda Sagar University",
    },
    {
      name: "MD Zamaan",
      role: "Student, Dayananda Sagar University",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-3">Meet Our Team</h1>
              <p className="text-lg text-muted-foreground">The creative minds behind Project Connect</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

