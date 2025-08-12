/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable class-based dark mode
  darkMode: 'class',

  // Specify the paths to all of your component files and pages
  // so Tailwind can tree-shake unused styles in production builds.
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],

  theme: {
    // Extend the default Tailwind theme
    extend: {
      // Define your custom color palette
      colors: {
        // Primary color for branding, buttons, and links
        primary: {
          light: '#3b82f6', // blue-500
          DEFAULT: '#2563eb', // blue-600 (used when you just write `bg-primary`)
          dark: '#1d4ed8',  // blue-700
        },
        // Accent color for highlights, success states, etc.
        accent: {
          light: '#22c55e', // green-500
          DEFAULT: '#10b981', // emerald-500
          dark: '#059669',  // emerald-600
        },
        // Background colors for light and dark modes
        background: {
          light: '#f9fafb', // gray-50
          dark: '#1f2937',  // gray-800
        },
        // Container/card colors
        container: {
            light: '#ffffff', // white
            dark: '#374151',  // gray-700
        }
      },
      // You can also extend other theme properties like fonts
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example: adds Inter font
      },
    },
  },

  // Register Tailwind plugins
  plugins: [
    // This plugin provides a basic reset for form styles,
    // making it much easier to style them with utility classes.
    require('@tailwindcss/forms'),
  ],
};