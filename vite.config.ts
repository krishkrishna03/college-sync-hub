import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
<<<<<<< HEAD
// vite.config.ts
=======
>>>>>>> a655124e77d653c08f2b61172894d4d4f8b7064c
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
<<<<<<< HEAD
    proxy: {
      "/api": "http://localhost:5000",  // forward API requests to backend
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
=======
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
>>>>>>> a655124e77d653c08f2b61172894d4d4f8b7064c
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
