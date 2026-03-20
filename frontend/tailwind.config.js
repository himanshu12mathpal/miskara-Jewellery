/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Core palette — logo inspired ──
        forest:  '#1a3c2e',   // deep green from logo
        forest2: '#234d3a',
        forest3: '#2d6147',
        forestLt:'#3a7a5a',
        leaf:    '#4a9470',
        leafLt:  '#6aad8a',
        sage:    '#8fbc9e',
        sageLt:  '#c4dbc9',
        sageXlt: '#edf5ef',

        // ── Off-white warm base ──
        offwhite: '#f8f5f0',
        offwhite2:'#f2ede6',
        offwhite3:'#ede5da',
        parchment:'#e8ddd0',

        // ── Gold premium accent ──
        gold:    '#c9a84c',
        gold2:   '#e0bf6a',
        gold3:   '#a8882c',
        goldsft: 'rgba(201,168,76,0.12)',

        // ── Text ──
        ink:     '#1a1a14',
        ink2:    '#2d2d20',
        muted:   '#7a7060',
        muted2:  '#a89880',

        // ── Surface ──
        surface: '#ffffff',
        surfaceAlt: '#faf7f2',
      },
      fontFamily: {
        sans:    ["'Cormorant Garamond'", "'Playfair Display'", 'Georgia', 'serif'],
        display: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        body:    ["'Jost'", 'sans-serif'],
        heading: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        ui:      ["'Jost'", 'sans-serif'],
      },
      backgroundImage: {
        'hero':      'linear-gradient(135deg, #f8f5f0 0%, #f2ede6 50%, #ede5da 100%)',
        'forest-grad':'linear-gradient(135deg, #1a3c2e 0%, #2d6147 100%)',
        'gold-grad': 'linear-gradient(135deg, #c9a84c 0%, #e0bf6a 100%)',
        'premium':   'linear-gradient(135deg, #1a3c2e 0%, #234d3a 50%, #1a3c2e 100%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.8s cubic-bezier(.16,1,.3,1) forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'float':      'float 7s ease-in-out infinite',
        'float-slow': 'floatSlow 10s ease-in-out infinite',
        'marquee':    'marquee 32s linear infinite',
        'shimmer':    'shimmer 3s linear infinite',
        'spin-slow':  'spin 14s linear infinite',
        'glow':       'glow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { from:{opacity:'0',transform:'translateY(28px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        fadeIn:    { from:{opacity:'0'}, to:{opacity:'1'} },
        float:     { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-12px)'} },
        floatSlow: { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-7px)'} },
        marquee:   { from:{transform:'translateX(0)'}, to:{transform:'translateX(-50%)'} },
        shimmer:   { '0%':{backgroundPosition:'-200% center'}, '100%':{backgroundPosition:'200% center'} },
        glow:      { '0%,100%':{opacity:'0.5'}, '50%':{opacity:'1'} },
      },
      boxShadow: {
        'premium':  '0 20px 60px rgba(26,60,46,0.15), 0 4px 20px rgba(26,60,46,0.08)',
        'card':     '0 4px 24px rgba(26,60,46,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'card-lg':  '0 16px 48px rgba(26,60,46,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        'gold':     '0 6px 24px rgba(201,168,76,0.3)',
        'glass':    '0 8px 32px rgba(26,60,46,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-lg': '0 20px 60px rgba(26,60,46,0.1), 0 4px 16px rgba(0,0,0,0.04)',
        'inner':    'inset 0 1px 0 rgba(255,255,255,0.8)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
