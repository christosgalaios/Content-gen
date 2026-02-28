/* eslint-env node */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF6B35",
          secondary: "#004E89",
          accent: "#F7C948",
          dark: "#1A1A2E",
          light: "#F5F5F5",
        },
      },
      fontFamily: {
        display: ["Montserrat", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
