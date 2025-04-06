export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">&copy; 2024 Project Connect. All rights reserved.</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About Us
            </a>
            <a href="/team" className="text-sm text-muted-foreground hover:text-foreground">
              Our Team
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

