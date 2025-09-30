import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // FIX: Replaced `process.cwd()` with `'.'` to resolve a TypeScript error where the `cwd` method was not found on the `process` object.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      // FIX: Define `process.env.API_KEY` for use with the Gemini API, per coding guidelines. The value is sourced from `VITE_API_KEY` in the .env file.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    }
  }
})
