/**
 * Design-Tokens gemäß Spezifikation Abschnitt 6, Fassung „Aurora" — verbindlich.
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
        tinte: '#04342C',
        himmel: '#378ADD',
        aurora: '#185FA5',
        bernstein: { DEFAULT: '#FAC775', text: '#412402' },
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
        karte: '16px',
      },
      boxShadow: {
        schwebend: '0 6px 18px rgba(4, 52, 44, 0.10)',
        'schwebend-lg': '0 14px 36px rgba(4, 52, 44, 0.16)',
      },
      backgroundImage: {
        'aurora-hero': 'linear-gradient(120deg, #04342C 0%, #0F6B6B 55%, #185FA5 100%)',
        'aurora-balken': 'linear-gradient(90deg, #0F6B6B 0%, #378ADD 100%)',
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
