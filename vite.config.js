import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
  ],
	build: {
		lib: {
			entry: "./src/lib.js",
			name: 'webp-idec',
			fileName: 'webp-idec',
			formats: ['es'],
		},
		sourcemap: true,
		minify: true,
	}
});
