/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#4CAF50',
        },
        surface: '#FFFFFF',
        background: '#F5F5F5',
        text: {
          primary: '#1A1A1A',
          secondary: '#666666',
        },
        accent: '#FF8F00',
        error: '#D32F2F',
        success: '#388E3C',
      }
    },
  },
  plugins: [],
}
