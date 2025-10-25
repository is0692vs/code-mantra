import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('hirokimukai.code-mantra'));
	});

	test('Should activate extension', async () => {
		const ext = vscode.extensions.getExtension('hirokimukai.code-mantra');
		await ext?.activate();
		assert.ok(ext?.isActive);
	});

	test('Should have triggers configuration', () => {
		const config = vscode.workspace.getConfiguration('codeMantra');
		const triggers = config.get('triggers');

		assert.ok(triggers);
		assert.strictEqual(typeof triggers, 'object');
	});

	test('Should have fileTypes configuration', () => {
		const config = vscode.workspace.getConfiguration('codeMantra');
		const fileTypes = config.get<string[]>('fileTypes');

		assert.ok(Array.isArray(fileTypes));
		assert.ok(fileTypes!.length > 0);
	});

	test('Should have excludePatterns configuration', () => {
		const config = vscode.workspace.getConfiguration('codeMantra');
		const excludePatterns = config.get<string[]>('excludePatterns');

		assert.ok(Array.isArray(excludePatterns));
	});
});
