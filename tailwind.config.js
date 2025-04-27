/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Catppuccin Frappe palette
        rosewater: "#f2d5cf",
        flamingo: "#eebebe", 
        pink: "#f4b8e4",
        mauve: "#ca9ee6",
        red: "#e78284",
        maroon: "#ea999c",
        peach: "#ef9f76",
        yellow: "#e5c890",
        green: "#a6d189",
        teal: "#81c8be",
        sky: "#99d1db",
        sapphire: "#85c1dc",
        blue: "#8caaee",
        lavender: "#babbf1",
        text: "#c6d0f5",
        subtext1: "#b5bfe2",
        subtext0: "#a5adce",
        overlay2: "#949cbb",
        overlay1: "#838ba7",
        overlay0: "#737994",
        surface2: "#626880",
        surface1: "#51576d",
        surface0: "#414559",
        base: "#303446",
        mantle: "#292c3c",
        crust: "#232634",
        background: '#1E202C',
        foreground: '#f8f8f2',
        card: "#292c3c",
        "card-foreground": "#c6d0f5",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        wobble: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '15%': { transform: 'translateX(-5px) rotate(-5deg)' },
          '30%': { transform: 'translateX(5px) rotate(5deg)' },
          '45%': { transform: 'translateX(-3px) rotate(-3deg)' },
          '60%': { transform: 'translateX(3px) rotate(3deg)' },
          '75%': { transform: 'translateX(-1px) rotate(-1deg)' },
          '90%': { transform: 'translateX(1px) rotate(1deg)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fadeIn": "fadeIn 0.3s ease-out forwards",
        "fadeOut": "fadeOut 0.3s ease-out forwards",
        "slideUp": "slideUp 0.3s ease-out forwards",
        "slideDown": "slideDown 0.3s ease-out forwards",
        "bounce": "bounce 1s ease-in-out infinite",
        "pulse": "pulse 2s ease-in-out infinite",
        "wobble": "wobble 0.5s ease-in-out"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}