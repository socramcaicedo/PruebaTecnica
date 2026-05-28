/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 1. Escanea los archivos de la app demo
    "./src/*/.{html,ts}", 
    // 2. ¡Súper importante! Escanea los archivos de tu librería
    "../ui-lib/src/lib/*/.{html,ts}"
  ]
  ,
  theme: {
    extend: {},
  },
  plugins: [],
}

