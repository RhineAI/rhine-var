import { type Config } from 'rhine-lint'

export default {
  // Project level: 'normal' | 'react' | 'next'
  level: 'normal',

  // Enable TypeScript support
  typescript: true,

  // Enable project-based type checking
  projectTypeCheck: true,

  // Additional ignore patterns
  ignores: [],

  // ESLint specific configuration
  eslint: {
    enable: true,
    config: [],
  },

  // Prettier specific configuration
  prettier: {
    enable: true,
    config: {},
  },
} as Config
