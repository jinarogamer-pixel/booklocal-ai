"use client";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // On mount, check localStorage or system preference
    const ls = localStorage.getItem("theme");
    if (ls === "dark" || (!ls && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDark(false);
    }
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };
  return (
    <button className="dark-toggle" onClick={toggle} aria-label="Toggle dark mode">
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
