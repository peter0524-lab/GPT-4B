/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#635BFF",
        "primary-dark": "#584CDC",
      },
      fontFamily: {
        display: ["Pretendard", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 16px 45px rgba(99, 91, 255, 0.18)",
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      fontSize: {
        'responsive-xs': 'clamp(10px, 2.5vw, 12px)',
        'responsive-sm': 'clamp(12px, 3vw, 14px)',
        'responsive-base': 'clamp(14px, 3.5vw, 16px)',
        'responsive-lg': 'clamp(16px, 4vw, 20px)',
        'responsive-xl': 'clamp(20px, 5vw, 28px)',
        'responsive-2xl': 'clamp(24px, 6vw, 36px)',
      },
    },
  },
  plugins: [],
};
