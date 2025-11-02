/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Add your custom colors here
      colors: {
        primary: '#3B82F6',   // A nice blue
        secondary: '#10B981', // A vibrant green
        accent: '#8B5CF6',    // A cool purple
        dark: '#1F2937',      // A dark gray
      }
    },
  },
  plugins: [],
}