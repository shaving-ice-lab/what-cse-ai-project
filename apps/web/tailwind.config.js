/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // 琥珀金主色系
        amber: {
          50: "hsl(48, 100%, 96%)",
          100: "hsl(48, 96%, 89%)",
          200: "hsl(48, 97%, 77%)",
          300: "hsl(46, 97%, 65%)",
          400: "hsl(43, 96%, 56%)",
          500: "hsl(38, 92%, 50%)",
          600: "hsl(32, 95%, 44%)",
          700: "hsl(26, 90%, 37%)",
          800: "hsl(23, 83%, 31%)",
          900: "hsl(22, 78%, 26%)",
        },
        // 暖石色中性色系
        stone: {
          50: "hsl(60, 9%, 98%)",
          100: "hsl(60, 5%, 96%)",
          200: "hsl(20, 6%, 90%)",
          300: "hsl(24, 6%, 83%)",
          400: "hsl(24, 5%, 64%)",
          500: "hsl(25, 5%, 45%)",
          600: "hsl(33, 5%, 32%)",
          700: "hsl(30, 6%, 25%)",
          800: "hsl(12, 6%, 15%)",
          900: "hsl(24, 10%, 10%)",
          950: "hsl(20, 14%, 4%)",
        },
        // 语义色
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Noto Serif SC', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        'amber-sm': 'var(--shadow-amber-sm)',
        'amber': 'var(--shadow-amber)',
        'amber-md': 'var(--shadow-amber-md)',
        'amber-lg': 'var(--shadow-amber-lg)',
        'amber-xl': 'var(--shadow-amber-xl)',
        'warm-sm': 'var(--shadow-warm-sm)',
        'warm': 'var(--shadow-warm)',
        'warm-md': 'var(--shadow-warm-md)',
        'warm-lg': 'var(--shadow-warm-lg)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px -4px rgba(245, 158, 11, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(245, 158, 11, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s infinite",
        "shimmer": "shimmer 2s infinite linear",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-amber': 'linear-gradient(135deg, hsl(38, 92%, 50%) 0%, hsl(32, 95%, 44%) 100%)',
        'gradient-warm': 'linear-gradient(135deg, hsl(48, 96%, 89%) 0%, hsl(60, 9%, 98%) 100%)',
        'mesh-gradient': `
          radial-gradient(at 40% 20%, hsla(48, 100%, 96%, 1) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsla(38, 92%, 50%, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsla(48, 96%, 89%, 0.5) 0px, transparent 50%),
          radial-gradient(at 80% 50%, hsla(32, 95%, 44%, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, hsla(48, 100%, 96%, 0.5) 0px, transparent 50%)
        `,
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
