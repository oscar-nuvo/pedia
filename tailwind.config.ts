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
				sans: ['Lexend', 'system-ui', 'sans-serif'],
				display: ['Gabarito', 'system-ui', 'sans-serif'],
				mono: ['Geist Mono', 'monospace'],
			},
			colors: {
				// Rezzy Brand Colors - Refreshed Palette
				'rezzy': {
					// Primary - Sage (Trust, calm, healthcare)
					sage: '#4A9B8C',
					'sage-light': '#6DB3A5',
					'sage-lighter': '#A8D4CA',
					'sage-pale': '#E8F5F1',

					// Background - Cream (Warm, nurturing, inviting)
					cream: '#FDF8F3',
					'cream-warm': '#F5EBE0',
					'cream-deep': '#E8DED3',

					// Accent - Coral (Energy, approachable, playful)
					coral: '#E8927C',
					'coral-light': '#F4B4A4',
					'coral-pale': '#FDE8E4',

					// Text - Ink (Readable, professional)
					ink: '#1A3A34',
					'ink-soft': '#2D524A',
					'ink-muted': '#5A7A72',
					'ink-light': '#8CA39C',

					// Legacy mappings for compatibility (maps to new colors)
					teal: '#4A9B8C',
					'teal-light': '#6DB3A5',
					'teal-dark': '#3D8577',
					'cream-light': '#FDF8F3',
					'cream-dark': '#E8DED3',
					orange: '#E8927C',
					'orange-light': '#F4B4A4',
					'orange-dark': '#D47A64',
					mint: '#A8D4CA',
					'mint-light': '#C4E5DD',
					'mint-dark': '#7AC4A8',
					'slate-900': '#1A3A34',
					'slate-800': '#2D524A',
					'slate-700': '#3D6358',
					'slate-600': '#5A7A72',
					'slate-500': '#7A9A92',
					'slate-400': '#8CA39C',
					'slate-300': '#B8CCC6',
					'slate-200': '#D4E2DE',
					'slate-100': '#E8F5F1',
					'slate-50': '#FDF8F3',
					green: '#4A9B8C',
					'green-dim': '#3D8577',
					black: '#1A3A34',
					'off-black': '#2D524A',
					'dark': '#3D6358',
					white: '#FDF8F3',
					'off-white': '#F5EBE0',
					gray: '#7A9A92',
					'gray-dark': '#5A7A72',
					'gray-light': '#8CA39C',
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
				md: 'calc(var(--radius) - 4px)',
				sm: 'calc(var(--radius) - 8px)',
				DEFAULT: '24px',
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
				// Organic blob morphing animation
				'blob-morph': {
					'0%, 100%': {
						borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
						transform: 'rotate(0deg) scale(1)'
					},
					'25%': {
						borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
						transform: 'rotate(90deg) scale(1.05)'
					},
					'50%': {
						borderRadius: '50% 60% 30% 60% / 30% 40% 70% 50%',
						transform: 'rotate(180deg) scale(1)'
					},
					'75%': {
						borderRadius: '70% 40% 50% 40% / 60% 50% 30% 50%',
						transform: 'rotate(270deg) scale(0.95)'
					}
				},
				// Playful bounce for dots/indicators
				'bounce-dot': {
					'0%, 100%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(-25%)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				// Squiggle underline reveal
				'draw-squiggle': {
					'0%': {
						strokeDashoffset: '100',
						opacity: '0'
					},
					'50%': {
						opacity: '1'
					},
					'100%': {
						strokeDashoffset: '0',
						opacity: '1'
					}
				},
				// Soft glow animation
				'soft-glow': {
					'0%, 100%': { boxShadow: '0 4px 14px rgba(232, 146, 124, 0.15)' },
					'50%': { boxShadow: '0 4px 20px rgba(232, 146, 124, 0.25)' }
				},
				// Gentle pulse
				'gentle-pulse': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(74, 155, 140, 0.2)' },
					'50%': { boxShadow: '0 0 0 8px rgba(74, 155, 140, 0)' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'count-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'breathe': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.02)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'grow': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				// Spring-based entrance
				'spring-in': {
					'0%': {
						transform: 'scale(0.9) translateY(10px)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.02) translateY(-2px)'
					},
					'100%': {
						transform: 'scale(1) translateY(0)',
						opacity: '1'
					}
				},
				// Wiggle for attention
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-2deg)' },
					'50%': { transform: 'rotate(2deg)' }
				},
				// Thinking indicator animations
				'thinking-float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'antenna-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.6',
						transform: 'scale(1.3)'
					}
				},
				'cursor-blink': {
					'0%, 50%': { opacity: '1' },
					'51%, 100%': { opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'blob-morph': 'blob-morph 15s ease-in-out infinite',
				'bounce-dot': 'bounce-dot 1s ease-in-out infinite',
				'draw-squiggle': 'draw-squiggle 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
				'soft-glow': 'soft-glow 3s ease-in-out infinite',
				'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
				'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'count-up': 'count-up 0.5s ease-out forwards',
				'breathe': 'breathe 4s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'grow': 'grow 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'spring-in': 'spring-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'wiggle': 'wiggle 0.5s ease-in-out',
				'thinking-float': 'thinking-float 2s ease-in-out infinite',
				'antenna-pulse': 'antenna-pulse 1.5s ease-in-out infinite',
				'cursor-blink': 'cursor-blink 0.8s step-end infinite'
			},
			// Spring-based easing functions
			transitionTimingFunction: {
				'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'spring-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'spring-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
