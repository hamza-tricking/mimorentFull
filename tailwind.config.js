// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-red": "#ff4d6d",
        "custom-pink": "#ff758f",
        "custom-rose": "#ff8fa3",
        "custom-red-hover": "#ff5a78",
        "custom-pink-hover": "#ff82a0",
        "custom-rose-hover": "#ff96b4",
      },
    },
  },
  plugins: [],
};