const root = document.documentElement
const theme = document.querySelector<HTMLButtonElement>("[data-theme-toggle]")

function apply(themeName: "light" | "dark") {
  root.dataset.theme = themeName
  localStorage.setItem("theme", themeName)
  theme?.setAttribute("aria-label", themeName === "dark" ? "Switch to light theme" : "Switch to dark theme")
}

theme?.addEventListener("click", () => {
  apply(root.dataset.theme === "dark" ? "light" : "dark")
})

apply(root.dataset.theme === "dark" ? "dark" : "light")

export {}
