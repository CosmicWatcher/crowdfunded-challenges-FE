/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        funding: "funding 15s linear infinite",
        "button-pulse": "button-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-border": "glow-border 5s linear infinite",
      },
      keyframes: {
        funding: {
          "0%, 100%": {
            "background-size": "800% 800%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "800% 800%",
            "background-position": "right center",
          },
        },
        "button-pulse": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1.2)",
          },
          "50%": {
            opacity: "0.9",
            transform: "scale(0.95)",
          },
        },
        "glow-border": {
          "0%, 100%": {
            "box-shadow":
              "0 0 30px theme(colors.primary.DEFAULT), 0 0 30px theme(colors.primary.DEFAULT)",
          },
          "33%": {
            "box-shadow":
              "0 0 30px theme(colors.task.community), 0 0 30px theme(colors.task.community)",
          },
          "66%": {
            "box-shadow":
              "0 0 30px theme(colors.task.personal), 0 0 30px theme(colors.task.personal)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        backgroundTransparent: "hsla(var(--background-transparent))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        task: {
          community: "hsl(var(--task-community))",
          personal: "hsl(var(--task-personal))",
        },
        status: {
          success: {
            main: "hsl(var(--status-success))",
            border: "hsl(var(--border-status-success))",
          },
          fail: {
            main: "hsl(var(--status-fail))",
            border: "hsl(var(--border-status-fail))",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
