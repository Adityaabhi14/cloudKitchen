/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chilli: {
          50: '#FDF2F2',
          100: '#FCE7E7',
          200: '#F9D1D0',
          300: '#F4A6A4',
          400: '#EB6E6B',
          500: '#DE3C37',
          600: '#C8281E', // Primary Chilli Red
          700: '#A31E16',
          800: '#841C16',
          900: '#6E1B16',
          950: '#3D0A08',
        },
        turmeric: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706', // Primary Turmeric Gold
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        leaf: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534', // Banana Leaf
          900: '#14532D',
        },
        tamarind: {
          50: '#FAF6F4',
          100: '#F4EAE5',
          200: '#E9D6CD',
          300: '#D6B7A8',
          400: '#BA8D78',
          500: '#9B6750',
          600: '#7D4F3B',
          700: '#5E3B2C',
          800: '#3B2219', // Tamarind Spiced Earth
          900: '#291610',
          950: '#170B07',
        },
        cream: {
          50: '#FFFEFC',
          100: '#FFFDF9',
          200: '#FAF5ED', // Warm Silk Neutral
          300: '#F4EBD9',
          400: '#EBDCC3',
          500: '#DEC5A3',
        },
        charcoal: {
          50: '#F6F5F4',
          100: '#E7E5E4',
          200: '#D6D3D1',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#292524',
          800: '#1C1917',
          900: '#141210',
          950: '#0C0A09',
        }
      },
      fontFamily: {
        sans:    ['var(--font-outfit)',  'system-ui', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'Georgia',  'serif'],
        display: ['var(--font-playfair)', 'Georgia',  'serif'],
        telugu:  ['var(--font-telugu)',  'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(59, 34, 25, 0.08), 0 1px 2px rgba(59, 34, 25, 0.04)',
        'warm-md': '0 4px 14px rgba(59, 34, 25, 0.1), 0 2px 6px rgba(59, 34, 25, 0.06)',
        'warm-lg': '0 10px 25px rgba(59, 34, 25, 0.12), 0 4px 10px rgba(59, 34, 25, 0.08)',
        'warm-xl': '0 20px 35px rgba(59, 34, 25, 0.16), 0 8px 16px rgba(59, 34, 25, 0.1)',
        'chilli-glow': '0 4px 20px rgba(200, 40, 30, 0.35)',
        'turmeric-glow': '0 4px 20px rgba(217, 119, 6, 0.35)',
        'inner-warm': 'inset 0 2px 4px rgba(59, 34, 25, 0.06)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'spice-spin': 'spiceSpin 20s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-4deg)' },
        },
        spiceSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}
