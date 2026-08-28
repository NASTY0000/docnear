"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("dn-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button type="button" onClick={toggle} className="btn-ghost px-3" aria-label="Toggle dark mode">
      {dark ? "Light" : "Dark"}
    </button>
  );
}
