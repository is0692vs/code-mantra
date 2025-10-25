import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('is0692vs.code-mantra'));
	});

	test('Should activate extension', async () => {
		const ext = vscode.extensions.getExtension('is0692vs.code-mantra');
		await ext?.activate();
		assert.ok(ext?.isActive);
	});
});
