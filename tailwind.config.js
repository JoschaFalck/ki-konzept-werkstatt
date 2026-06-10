/**
 * Design-Tokens gemäß Spezifikation Abschnitt 6 — verbindlich.
 * Keine Inline-Hexwerte im Code; ausschließlich diese Token-Klassen.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './content/**/*.ts'],
  theme: {
    extend: {
      colors: {
        flaeche: '#FAFAF7',
        karte: '#FFFFFF',
        text: '#1F2933',
        sekundaer: '#52606D',
        primaer: { DEFAULT: '#0F6B6B', hover: '#0C5757' },
        akzent: '#B7791F',
        fehler: '#B3261E',
        erfolg: '#2F6B3F',
        dim: {
          d1: '#0F6B6B',
          d2: '#3B5BA5',
          d3: '#7B4FA3',
          d4: '#A04668',
          d5: '#B7791F',
          d6: '#4E7A4E',
          d7: '#5C6B73',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        karte: '12px',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        base: ['15px', '1.6'],
      },
    },
  },
  plugins: [],
};
