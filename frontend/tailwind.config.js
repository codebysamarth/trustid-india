/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trust: {
          navy: {
            950: '#070C18',
            900: '#0B132B',
            800: '#131F42',
            700: '#1C2E5D',
            600: '#273F7A',
            500: '#34529E',
          },
          blue: {
            50: '#F0F7FF',
            100: '#E0EFFF',
            200: '#BAE0FF',
            300: '#7CC4FA',
            400: '#38A3F8',
            500: '#0284C7',
            600: '#0369A1',
            700: '#075985',
          },
          cyan: {
            400: '#22D3EE',
            500: '#06B6D4',
            600: '#0891B2',
          },
          surface: {
            ground: '#0B132B',
            card: '#131F42',
            subtle: '#1C2E5D',
            light: '#F8FAFC',
            lightCard: '#FFFFFF',
            lightBorder: '#E2E8F0',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
