/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Deep Electric Blue (from logo)
        'club-blue': '#004aad',
        // Secondary: Off-White / Cream
        'club-cream': '#fffcf7',
        // Accent: Midnight Lilac
        'club-lilac': '#4A3E8E',
        // Neutral: Graphite / Charcoal
        'club-charcoal': '#1E1E1E',
        // Highlight: Warm Gold
        'club-gold': '#C7A977',
      },
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
