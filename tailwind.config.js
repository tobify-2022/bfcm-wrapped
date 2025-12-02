/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './client/index.html',
    './client/src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Shopify brand colors
        shopify: {
          green: '#95BF47',
          'dark-green': '#2C3539',
          blue: '#008060',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}

