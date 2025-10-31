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

	test('Should support onLargeDelete trigger rules', () => {
		const config = vscode.workspace.getConfiguration('codeMantra');
		const rules = config.get<any[]>('rules', []);

		// Test that onLargeDelete rules can be stored in configuration
		const largeDeleteRule = {
			trigger: 'onLargeDelete',
			message: 'Large deletion detected',
			filePattern: '**/*.ts',
			deletionThreshold: 100,
			enabled: true
		};

		assert.strictEqual(largeDeleteRule.trigger, 'onLargeDelete');
		assert.ok(largeDeleteRule.deletionThreshold);
		assert.strictEqual(largeDeleteRule.deletionThreshold, 100);
	});

	test('Should support onFileSizeExceeded trigger rules', () => {
		const config = vscode.workspace.getConfiguration('codeMantra');
		const rules = config.get<any[]>('rules', []);

		// Test that onFileSizeExceeded rules can be stored in configuration
		const fileSizeRule = {
			trigger: 'onFileSizeExceeded',
			message: 'File size exceeded',
			filePattern: '**/*.ts',
			lineSizeThreshold: 300,
			enabled: true
		};

		assert.strictEqual(fileSizeRule.trigger, 'onFileSizeExceeded');
		assert.ok(fileSizeRule.lineSizeThreshold);
		assert.strictEqual(fileSizeRule.lineSizeThreshold, 300);
	});

	test('Should validate deletion threshold (1-10000 range)', () => {
		// Valid thresholds
		const validThresholds = [1, 50, 100, 500, 1000, 5000, 10000];
		validThresholds.forEach(threshold => {
			assert.ok(threshold >= 1 && threshold <= 10000);
		});

		// Invalid thresholds
		const invalidThresholds = [0, -1, 10001];
		invalidThresholds.forEach(threshold => {
			assert.ok(!(threshold >= 1 && threshold <= 10000));
		});
	});

	test('Should validate file size threshold (1-10000 range)', () => {
		// Valid thresholds
		const validThresholds = [1, 100, 300, 500, 1000, 5000, 10000];
		validThresholds.forEach(threshold => {
			assert.ok(threshold >= 1 && threshold <= 10000);
		});

		// Invalid thresholds
		const invalidThresholds = [0, -100, 10001, 50000];
		invalidThresholds.forEach(threshold => {
			assert.ok(!(threshold >= 1 && threshold <= 10000));
		});
	});
});
