import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs}"],
		...js.configs.recommended,
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		rules: {
			"no-undef": "error",
			"no-unreachable": "error",
			"no-constant-condition": "warn",
			"no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"no-console": "warn",
			"no-debugger": "warn",
			"prefer-const": "error",
			"no-var": "error",
			eqeqeq: ["error", "always"],
			curly: "error",
			"dot-notation": "error",
			"no-duplicate-imports": "error",
			"no-shadow": "warn",
			"no-use-before-define": ["error", { functions: false }],
			"object-shorthand": "warn",
			"arrow-body-style": ["warn", "as-needed"],
		},
	},
	{
		ignores: ["node_modules", "dist", "build", "coverage"],
	},
]);
