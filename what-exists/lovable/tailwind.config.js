/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        hand: ['var(--font-hand)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
        wordmark: ['var(--font-wordmark)'],
      },
      letterSpacing: {
        wide: '0.04em',
        wider: '0.08em',
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 4px)',
  			sm: 'calc(var(--radius) - 8px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
        dusty: {
          blue: 'hsl(210 25% 55%)',
          pink: 'hsl(340 20% 65%)',
          orange: 'hsl(25 50% 62%)',
          purple: 'hsl(270 15% 55%)',
          teal: 'hsl(180 15% 50%)',
        },
        moss: 'hsl(140 18% 48%)',
        clay: 'hsl(5 35% 52%)',
        /* spring meadows */
        herald: 'var(--herald)',
        olive: 'var(--olive)',
        horizon: 'var(--horizon)',
        lavender: 'var(--dusty-lavender)',
        terracotta: 'var(--terracotta)',
        'spanish-green': 'var(--spanish-green)',
        neptune: 'var(--neptune)',
        rose: 'var(--rose)',
        tangerine: 'var(--atomic-tangerine)',
        'sweet-mint': 'var(--sweet-mint)',
        dewpoint: 'var(--dewpoint)',
        fairytale: 'var(--fairytale)',
        buttercup: 'var(--buttercup)',
        pancake: 'var(--pancake)',
        wisteria: 'var(--wisteria)',
        tumbleweed: 'var(--tumbleweed)',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
      boxShadow: {
        'paper': '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'paper-hover': '0 8px 24px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)',
        'paper-lg': '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      },
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
