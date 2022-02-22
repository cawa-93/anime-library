export default {
  "*.{js,ts,vue}": "eslint --cache --fix",
  "packages/main/**/*.ts": () => `npm run typecheck:main`,
  "packages/preload/**/*.ts": () => `npm run typecheck:preload`,
  'packages/renderer/**/*.{ts,vue}': () => `npm run typecheck:renderer`,
}
