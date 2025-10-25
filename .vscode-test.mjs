import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	extensionDevelopmentPath: '.',
	extensionTestsPath: './out/test/extension.test.js',
	files: './out/test/**/*.test.js',
	launchArgs: ['--disable-extensions'],
});
