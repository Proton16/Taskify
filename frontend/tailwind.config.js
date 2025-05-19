/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme
        background: "#f3f4f6",
        foreground: "#1a1a1a",
        accent: "#6366f1",
        muted: "#e5e7eb",
        // Dark theme
        'dark-background': "#18181b",
        'dark-foreground': "#f4f4f5",
        'dark-accent': "#818cf8",
        'dark-muted': "#27272a",
      },
    },
  },
  plugins: [],
}