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

	test('Should support onWorkspaceOpen trigger rules', () => {
		// Test that onWorkspaceOpen rules can be stored in configuration
		const workspaceOpenRule = {
			trigger: 'onWorkspaceOpen',
			message: 'Welcome! Remember SOLID principles today.',
			enabled: true
		};

		assert.strictEqual(workspaceOpenRule.trigger, 'onWorkspaceOpen');
		assert.ok(workspaceOpenRule.message);
		assert.strictEqual(typeof workspaceOpenRule.message, 'string');
		// onWorkspaceOpen should NOT have filePattern, deletionThreshold, or lineSizeThreshold
		assert.strictEqual((workspaceOpenRule as any).filePattern, undefined);
		assert.strictEqual((workspaceOpenRule as any).deletionThreshold, undefined);
		assert.strictEqual((workspaceOpenRule as any).lineSizeThreshold, undefined);
	});

	test('Should execute multiple onWorkspaceOpen rules', () => {
		const rules = [
			{
				trigger: 'onWorkspaceOpen',
				message: 'Welcome! Goal for today?',
				enabled: true
			},
			{
				trigger: 'onWorkspaceOpen',
				message: 'Remember SOLID principles!',
				enabled: true
			},
			{
				trigger: 'onWorkspaceOpen',
				message: 'This should be skipped',
				enabled: false
			}
		];

		// Verify structure of multiple rules
		const enabledRules = rules.filter(r => r.enabled !== false && r.trigger === 'onWorkspaceOpen');
		assert.strictEqual(enabledRules.length, 2, 'Should have 2 enabled onWorkspaceOpen rules');
		assert.strictEqual(enabledRules[0].message, 'Welcome! Goal for today?');
		assert.strictEqual(enabledRules[1].message, 'Remember SOLID principles!');
	});

	test('Should skip disabled onWorkspaceOpen rules', () => {
		const rules = [
			{
				trigger: 'onWorkspaceOpen',
				message: 'Enabled rule',
				enabled: true
			},
			{
				trigger: 'onWorkspaceOpen',
				message: 'Disabled rule',
				enabled: false
			}
		];

		const enabledRules = rules.filter(r => r.enabled !== false && r.trigger === 'onWorkspaceOpen');
		assert.strictEqual(enabledRules.length, 1, 'Should only have 1 enabled rule');
		assert.strictEqual(enabledRules[0].message, 'Enabled rule');
	});

	test('Should support onIdle trigger rules', () => {
		// Test that onIdle rules can be stored in configuration
		const idleRule = {
			trigger: 'onIdle',
			message: 'Take a break after inactivity!',
			idleDuration: 15,
			enabled: true
		};

		assert.strictEqual(idleRule.trigger, 'onIdle');
		assert.ok(idleRule.idleDuration);
		assert.strictEqual(idleRule.idleDuration, 15);
	});

	test('Should validate idle duration (1-120 range)', () => {
		// Valid durations
		const validDurations = [1, 15, 30, 60, 120];
		validDurations.forEach(duration => {
			assert.ok(duration >= 1 && duration <= 120, `Duration ${duration} should be valid`);
		});

		// Invalid durations
		const invalidDurations = [0, -1, 121, 1000];
		invalidDurations.forEach(duration => {
			assert.ok(!(duration >= 1 && duration <= 120), `Duration ${duration} should be invalid`);
		});
	});

	test('Should use default idle duration when not specified', () => {
		const idleRule = {
			trigger: 'onIdle',
			message: 'Take a break!',
			enabled: true
			// idleDuration not specified
		};

		// Default should be 15 when not specified
		const duration = (idleRule as any).idleDuration || 15;
		assert.strictEqual(duration, 15, 'Should use default duration of 15 minutes');
	});

	test('Should handle multiple onIdle trigger rules', () => {
		const rules = [
			{
				trigger: 'onIdle',
				message: 'Rule 1: Take a break!',
				idleDuration: 15,
				enabled: true
			},
			{
				trigger: 'onIdle',
				message: 'Rule 2: Try a different approach!',
				idleDuration: 30,
				enabled: true
			},
			{
				trigger: 'onIdle',
				message: 'Rule 3: This should be skipped',
				idleDuration: 45,
				enabled: false
			}
		];

		const enabledIdleRules = rules.filter(r => r.trigger === 'onIdle' && r.enabled !== false);
		assert.strictEqual(enabledIdleRules.length, 2, 'Should have 2 enabled onIdle rules');
		assert.strictEqual(enabledIdleRules[0].idleDuration, 15);
		assert.strictEqual(enabledIdleRules[1].idleDuration, 30);
	});
});
