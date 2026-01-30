import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Geist', 'system-ui', 'sans-serif'],
				mono: ['Geist Mono', 'monospace'],
				display: ['Geist', 'system-ui', 'sans-serif'],
			},
			colors: {
				// Rezzy Brand Colors - Clinical Precision Meets Neon Confidence
				'rezzy': {
					green: '#39FF14',
					'green-dim': '#2BD10F',
					black: '#000000',
					'off-black': '#0A0A0A',
					'dark': '#111111',
					white: '#FFFFFF',
					'off-white': '#F5F5F5',
					gray: '#71717A',
					'gray-dark': '#3F3F46',
					'gray-light': '#A1A1AA',
				},
				// Legacy brand colors (kept for compatibility)
				'brand-yellow': 'hsl(var(--brand-yellow))',
				'brand-lime': 'hsl(var(--brand-lime))',
				
				// Neutral colors
				'neutral': {
					50: 'hsl(var(--neutral-50))',
					100: 'hsl(var(--neutral-100))',
					200: 'hsl(var(--neutral-200))',
					300: 'hsl(var(--neutral-300))',
					400: 'hsl(var(--neutral-400))',
					500: 'hsl(var(--neutral-500))',
					600: 'hsl(var(--neutral-600))',
					700: 'hsl(var(--neutral-700))',
					800: 'hsl(var(--neutral-800))',
					900: 'hsl(var(--neutral-900))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(57, 255, 20, 0.3), 0 0 40px rgba(57, 255, 20, 0.1)' },
					'50%': { boxShadow: '0 0 30px rgba(57, 255, 20, 0.5), 0 0 60px rgba(57, 255, 20, 0.2)' }
				},
				'text-glow': {
					'0%, 100%': { textShadow: '0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.3)' },
					'50%': { textShadow: '0 0 20px rgba(57, 255, 20, 0.8), 0 0 40px rgba(57, 255, 20, 0.4)' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(50px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scanline': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100vh)' }
				},
				'terminal-blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},
				'count-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'breathe': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.02)' }
				},
				'flicker': {
					'0%, 100%': { opacity: '1' },
					'92%': { opacity: '1' },
					'93%': { opacity: '0.8' },
					'94%': { opacity: '1' },
					'97%': { opacity: '0.9' },
					'98%': { opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'text-glow': 'text-glow 2s ease-in-out infinite',
				'fade-up': 'fade-up 0.8s ease-out forwards',
				'fade-in': 'fade-in 0.6s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
				'scanline': 'scanline 8s linear infinite',
				'terminal-blink': 'terminal-blink 1s step-end infinite',
				'count-up': 'count-up 0.6s ease-out forwards',
				'breathe': 'breathe 3s ease-in-out infinite',
				'flicker': 'flicker 4s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
