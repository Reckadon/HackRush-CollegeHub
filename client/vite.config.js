import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			// This allows JSX in .js files
			include: "**/*.{jsx,js}",
		}),
	],
	resolve: {
		extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
	},
});
