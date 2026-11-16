/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af'
        },
        minsu: {
          primary: '#004D32',
          secondary: '#087A45',
          emerald: '#159957',
          gold: '#E5B52B',
          bg: '#F4F7F5',
          card: '#FFFFFF',
          text: '#172B24',
          muted: '#64748B',
          border: '#E2E8F0',
          blue: '#2563EB'
        }
      }
    }
  },
  plugins: []
};

