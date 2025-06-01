/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: {
    // Tailwind v4부터는 아래와 같이 @tailwindcss/postcss를 사용해야 합니다.
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};