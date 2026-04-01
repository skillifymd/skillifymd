import { meta } from "@/site/meta"

for (const node of document.querySelectorAll<HTMLElement>("[data-copy]")) {
  node.addEventListener("click", async () => {
    const text = node.dataset.copy
    if (!text) return

    await navigator.clipboard.writeText(text)

    const copy = node.querySelector<HTMLElement>(".copybtn") ?? node
    copy.classList.add("copied")
    window.setTimeout(() => copy.classList.remove("copied"), 1500)
  })
}

for (const switcher of document.querySelectorAll<HTMLElement>("[data-config-switcher]")) {
  const tabs = Array.from(switcher.querySelectorAll<HTMLButtonElement>("[data-config-tab]"))
  const panels = Array.from(switcher.querySelectorAll<HTMLElement>("[data-config-panel]"))
  const copy = switcher.querySelector<HTMLElement>("[data-config-copy]")

  function select(id: string) {
    for (const tab of tabs) {
      const active = tab.dataset.configTab === id
      tab.classList.toggle("is-active", active)
      tab.setAttribute("aria-selected", active ? "true" : "false")
      tab.tabIndex = active ? 0 : -1

      if (active && copy) {
        copy.dataset.copy = tab.dataset.copy ?? ""
        copy.querySelector<HTMLElement>(".copybtn")?.classList.remove("copied")
      }
    }

    for (const panel of panels) {
      const active = panel.dataset.configPanel === id
      panel.classList.toggle("is-active", active)
      panel.hidden = !active
    }
  }

  function move(currentIndex: number, offset: number) {
    const nextIndex = (currentIndex + offset + tabs.length) % tabs.length
    const nextTab = tabs[nextIndex]
    if (!nextTab) return
    select(nextTab.dataset.configTab ?? "")
    nextTab.focus()
  }

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => {
      const id = tab.dataset.configTab
      if (!id) return
      select(id)
    })

    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault()
        move(index, 1)
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        move(index, -1)
      }

      if (event.key === "Home") {
        event.preventDefault()
        const first = tabs[0]
        if (!first) return
        select(first.dataset.configTab ?? "")
        first.focus()
      }

      if (event.key === "End") {
        event.preventDefault()
        const last = tabs.at(-1)
        if (!last) return
        select(last.dataset.configTab ?? "")
        last.focus()
      }
    })
  }
}

const menu = document.querySelector<HTMLButtonElement>(".menu")
const drawer = document.querySelector<HTMLElement>(".drawer")

function open() {
  document.body.classList.add("menuopen")
  menu?.setAttribute("aria-expanded", "true")
  menu?.setAttribute("aria-label", "Close navigation menu")
}

function close() {
  document.body.classList.remove("menuopen")
  menu?.setAttribute("aria-expanded", "false")
  menu?.setAttribute("aria-label", "Open navigation menu")
}

menu?.addEventListener("click", () => {
  if (document.body.classList.contains("menuopen")) {
    close()
  } else {
    open()
  }
})

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("menuopen")) {
    close()
  }
})

for (const link of drawer?.querySelectorAll("a") ?? []) {
  link.addEventListener("click", close)
}

const stars = Array.from(document.querySelectorAll<HTMLElement>("[data-stars]"))

if (stars.length) {
  fetch(`https://api.github.com/repos/${meta.repo}`, {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then((result) => (result.ok ? result.json() : null))
    .then((data) => {
      if (!data || typeof data.stargazers_count !== "number") return
      const count = new Intl.NumberFormat("en-US").format(data.stargazers_count)
      for (const node of stars) node.textContent = count
    })
    .catch(() => {})
}

export {}
