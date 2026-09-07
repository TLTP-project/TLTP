import adapterVercel from "@sveltejs/adapter-vercel";
import adapterNode from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Vercel uses its serverless adapter in CI; Node keeps local Windows
    // builds free of pnpm symlink restrictions while preserving the same app.
    adapter: process.env.VERCEL ? adapterVercel() : adapterNode(),
    alias: {
      "@": "./src",
    },
  },
};

export default config;
