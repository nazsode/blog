module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // veya 'media' veya 'class'
  theme: {
    extend: {
      borderWidth: {
        2: "2px", // Örnek ekstra kalınlık
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
