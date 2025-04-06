document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle")
  const navLinks = document.querySelector(".nav-links")
  const navOverlay = document.querySelector(".nav-overlay")
  const body = document.body

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation()
    navLinks.classList.toggle("active")
    navOverlay.classList.toggle("active")
    menuToggle.classList.toggle("active")
    body.style.overflow = body.style.overflow === "hidden" ? "" : "hidden"
  })

  // Close menu when clicking overlay
  navOverlay.addEventListener("click", () => {
    navLinks.classList.remove("active")
    navOverlay.classList.remove("active")
    menuToggle.classList.remove("active")
    body.style.overflow = ""
  })

  // Prevent clicks inside menu from closing it
  navLinks.addEventListener("click", (e) => {
    e.stopPropagation()
  })

  // Theme toggle functionality
  const themeToggle = document.querySelector(".theme-toggle-fixed") || document.querySelector(".theme-toggle")
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")

  // Check for saved theme preference or use system preference
  const currentTheme = localStorage.getItem("theme") || (prefersDarkScheme.matches ? "dark" : "light")

  // Set initial theme
  document.documentElement.setAttribute("data-theme", currentTheme)

  // Theme toggle click handler
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const newTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light"

      document.documentElement.setAttribute("data-theme", newTheme)
      localStorage.setItem("theme", newTheme)
    })
  }
})

