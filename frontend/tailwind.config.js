/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'hero': ['Poppins', 'Montserrat', 'sans-serif'],  // or your chosen font
      },
      colors: {
        primary: {
          50: '#e6f0fb',
          100: '#cce1f7',
          200: '#99c3ef',
          300: '#66a5e7',
          400: '#3387df',
          500: '#196bc5',   // rgb(25,107,197)
          600: '#1456a0',
          700: '#0f4078',
          800: '#0a2b50',
          900: '#051528',
        },
        pink: {
          500: '#f6678c',    // rgb(246,103,140)
        },
        lightBlue: {
          500: '#b0d0e9',    // rgb(176,208,233)
        },
        purple: {
          500: '#8e4e89',    // rgb(142,78,137)
        }
      },
    },
  },
  plugins: [],
}