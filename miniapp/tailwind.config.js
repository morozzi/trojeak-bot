/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed'
        }
      }
    }
  },
  plugins: [
    // Note: @tailwindcss/forms may need to be updated for v4
    // You might need to install @tailwindcss/forms@next for v4 compatibility
  ]
}