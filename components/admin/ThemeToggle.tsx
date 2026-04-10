"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check current theme
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={20} className="text-amber-500" />
      ) : (
        <Moon size={20} className="text-slate-600" />
      )}
    </button>
  );
}
