import * as vscode from 'vscode';
import { TriggerManager } from './triggerManager';
import { TimerManager, TimeBasedNotification } from './timerManager';
import { TriggerTreeDataProvider, TriggerTreeItem } from './triggerTreeView';
import { TriggerDialog } from './triggerDialog';
import { IdleManager } from './idleManager';
import { SuppressionManager } from './suppressionManager';

interface Rule {
	trigger: 'onSave' | 'onEdit' | 'onOpen' | 'onFocus' | 'onLargeDelete' | 'onFileSizeExceeded' | 'onCreate' | 'onDelete' | 'onWorkspaceOpen' | 'onIdle' | 'onTimer';
	message: string;
	filePattern?: string;
	enabled?: boolean;
	deletionThreshold?: number;
	lineSizeThreshold?: number;
	duration?: number;
	timerType?: string;
}

let triggerManager: TriggerManager | undefined;
let timerManager: TimerManager | undefined;
let idleManager: IdleManager | undefined;
let suppressionManager: SuppressionManager | undefined;
// Track which files have already triggered onFileSizeExceeded to avoid duplicate notifications
const notifiedFilesForSize = new Map<string, Set<number>>();

export function activate(context: vscode.ExtensionContext) {
	console.log('[code-mantra] Extension activated');

	// Log initial configuration
	const initialConfig = vscode.workspace.getConfiguration('codeMantra');
	console.log('[code-mantra] Current configuration:', {
		enabled: initialConfig.get('enabled'),
		'triggers.onSave.enabled': initialConfig.get('triggers.onSave.enabled'),
		'triggers.onEdit.enabled': initialConfig.get('triggers.onEdit.enabled'),
		'triggers.onOpen.enabled': initialConfig.get('triggers.onOpen.enabled'),
		'triggers.onFocus.enabled': initialConfig.get('triggers.onFocus.enabled'),
		rules: initialConfig.get('rules')
	});

	// Initialize SuppressionManager
	suppressionManager = new SuppressionManager();
	console.log('[code-mantra] SuppressionManager initialized');

	// Initialize TriggerManager
	triggerManager = new TriggerManager(context, handleTrigger, suppressionManager);
	triggerManager.activate();

	// Initialize TimerManager
	timerManager = new TimerManager();
	initializeTimers();

	// Initialize IdleManager
	idleManager = new IdleManager(showNotification, getRules);
	idleManager.start();
	console.log('[code-mantra] IdleManager initialized and started');

	// Initialize the TreeView
	console.log('[code-mantra] Initializing TreeView...');
	const triggerTreeDataProvider = new TriggerTreeDataProvider(context);
	const treeView = vscode.window.createTreeView('codeMantraTriggers', {
		treeDataProvider: triggerTreeDataProvider,
		showCollapseAll: false,
		canSelectMany: false
	});
	context.subscriptions.push(treeView);
	console.log('[code-mantra] TreeView registered successfully');

	// Handle checkbox state changes
	treeView.onDidChangeCheckboxState(async (e) => {
		for (const [item] of e.items) {
			if (item instanceof TriggerTreeItem) {
				await triggerTreeDataProvider.toggleTrigger(item.index);
			}
		}
	});

	// Hello World command (for debugging)
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.helloWorld', () => {
			console.log('[code-mantra] Hello World command executed');
			vscode.window.showInformationMessage('🔔 Hello World from Code Mantra!');
		})
	);

	// Test Notification command (for debugging)
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.testNotification', () => {
			console.log('[code-mantra] Test notification command executed');
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				console.log(`[code-mantra] Active editor found: ${activeEditor.document.uri.fsPath}`);
				handleTrigger(activeEditor.document);
			} else {
				console.log('[code-mantra] No active editor, showing test notification');
				showNotification('Test notification from Code Mantra!');
			}
		})
	);

	// Add trigger command
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.addTrigger', async () => {
			const newTrigger = await TriggerDialog.showAddDialog();
			if (newTrigger) {
				await triggerTreeDataProvider.addTrigger(newTrigger);
			}
		})
	);

	// Edit trigger command
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.editTrigger', async (item: TriggerTreeItem) => {
			const updatedTrigger = await TriggerDialog.showEditDialog(item.rule);
			if (updatedTrigger) {
				await triggerTreeDataProvider.updateTrigger(item.index, updatedTrigger);
			}
		})
	);

	// Delete trigger command
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.deleteTrigger', async (item: TriggerTreeItem) => {
			const confirmed = await TriggerDialog.confirmDelete(item.rule.message);
			if (confirmed) {
				await triggerTreeDataProvider.deleteTrigger(item.index);
			}
		})
	);

	// Toggle trigger enabled/disabled command
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.toggleTrigger', async (item: TriggerTreeItem) => {
			await triggerTreeDataProvider.toggleTrigger(item.index);
		})
	);

	// Move trigger up command
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.moveTriggerUp', async (item: TriggerTreeItem) => {
			await triggerTreeDataProvider.moveUp(item.index);
		})
	);

	// Move trigger down command
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.moveTriggerDown', async (item: TriggerTreeItem) => {
			await triggerTreeDataProvider.moveDown(item.index);
		})
	);

	// Refresh triggers command
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.refreshTriggers', () => {
			triggerTreeDataProvider.refresh();
		})
	);

	// Reinitialize on configuration changes
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration('codeMantra.triggers') ||
				event.affectsConfiguration('codeMantra.fileTypes') ||
				event.affectsConfiguration('codeMantra.excludePatterns') ||
				event.affectsConfiguration('codeMantra.rules')) {
				console.log('[code-mantra] Trigger configuration changed, reactivating');
				triggerManager?.deactivate();
				triggerManager = new TriggerManager(context, handleTrigger);
				triggerManager.activate();

				// Reinitialize timers when rules change (may include onTimer rules)
				reinitializeTimers();
			}

			if (event.affectsConfiguration('codeMantra.timeBasedNotifications')) {
				console.log('[code-mantra] Time-based notification configuration changed');
				reinitializeTimers();
			}
		})
	);

	// Register onCreate trigger
	const onCreateDisposable = vscode.workspace.onDidCreateFiles((event) => {
		console.log('[code-mantra] onDidCreateFiles event triggered');
		const rules = getRules().filter(rule => rule.trigger === 'onCreate' && rule.enabled !== false);

		for (const file of event.files) {
			const filePath = file.fsPath;
			console.log(`[code-mantra] File created: ${filePath}`);

			// Check suppression
			if (suppressionManager?.shouldSuppress(filePath, 'onCreate')) {
				console.log('[code-mantra] Skipping onCreate due to suppression');
				continue;
			}

			for (const rule of rules) {
				if (shouldTriggerForFile(filePath, rule.filePattern)) {
					suppressionManager?.recordNotification(filePath, 'onCreate');
					showNotification(rule.message);
				}
			}
		}
	});
	context.subscriptions.push(onCreateDisposable);
	console.log('[code-mantra] onCreate trigger registered');

	// ファイルを開いた時に現在の行数を記録（閾値跨ぎ判定用）
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((document) => {
			if (suppressionManager && document.uri.scheme === 'file') {
				const filePath = document.uri.fsPath;
				const currentLineCount = document.lineCount;
				suppressionManager.updateLineCount(filePath, currentLineCount);
				console.log(`[code-mantra] Initialized line count tracking for ${filePath}: ${currentLineCount} lines`);
			}
		})
	);

	// Register onDelete trigger
	const onDeleteDisposable = vscode.workspace.onDidDeleteFiles((event) => {
		console.log('[code-mantra] onDidDeleteFiles event triggered');
		const rules = getRules().filter(rule => rule.trigger === 'onDelete' && rule.enabled !== false);

		for (const file of event.files) {
			console.log(`[code-mantra] File deleted: ${file.fsPath}`);
			for (const rule of rules) {
				if (shouldTriggerForFile(file.fsPath, rule.filePattern)) {
					showNotification(rule.message);
				}
			}
		}
	});
	context.subscriptions.push(onDeleteDisposable);
	console.log('[code-mantra] onDelete trigger registered');

	// Register onLargeDelete trigger
	const onLargeDeleteDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
		handleLargeDelete(event);
	});
	context.subscriptions.push(onLargeDeleteDisposable);
	console.log('[code-mantra] onLargeDelete trigger registered');

	// Register onFileSizeExceeded trigger
	const onFileSizeExceededDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
		handleFileSizeExceeded(event);
	});
	context.subscriptions.push(onFileSizeExceededDisposable);
	console.log('[code-mantra] onFileSizeExceeded trigger registered');

	// Clean up file tracking when file is closed
	const onCloseDisposable = vscode.workspace.onDidCloseTextDocument((document) => {
		notifiedFilesForSize.delete(document.uri.fsPath);
		suppressionManager?.cleanupFile(document.uri.fsPath);
	});
	context.subscriptions.push(onCloseDisposable);
	console.log('[code-mantra] File close handler registered');

	// Handle onWorkspaceOpen trigger (shows on activation)
	triggerManager.handleWorkspaceOpen();

	// Register timer reset events
	const config = vscode.workspace.getConfiguration('codeMantra');
	const timeBasedEnabled = config.get<boolean>('timeBasedNotifications.enabled', true);
	const resetOn = config.get<string[]>('timeBasedNotifications.resetOn', ['save']);

	if (timeBasedEnabled && resetOn) {
		if (resetOn.includes('save')) {
			context.subscriptions.push(
				vscode.workspace.onDidSaveTextDocument((document) => {
					// Mark file as being saved to suppress change events
					suppressionManager?.markFileSaving(document.uri.fsPath);

					// Update idle state on activity
					idleManager?.updateActivity();

					console.log('[code-mantra] File saved, resetting timers');
					reinitializeTimers();
				})
			);
		}

		if (resetOn.includes('focus')) {
			context.subscriptions.push(
				vscode.window.onDidChangeWindowState((state) => {
					if (state.focused) {
						// Update idle state on activity
						idleManager?.updateActivity();

						console.log('[code-mantra] Window focused, resetting timers');
						reinitializeTimers();
					}
				})
			);
		}
	}

	// Register activity tracking for onIdle trigger
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(() => {
			idleManager?.updateActivity();
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(() => {
			idleManager?.updateActivity();
		})
	);

	// Register TimerManager and IdleManager cleanup
	context.subscriptions.push({
		dispose: () => {
			idleManager?.stop();
			timerManager?.dispose();
		}
	});
}

export function deactivate() {
	triggerManager?.deactivate();
	idleManager?.stop();
	timerManager?.dispose();
	// Clear caches
	regexCache.clear();
	console.log('[code-mantra] Extension deactivated');
}

function initializeTimers(): void {
	const config = vscode.workspace.getConfiguration('codeMantra');
	const timeBasedEnabled = config.get<boolean>('timeBasedNotifications.enabled', true);

	// Clear all existing timers first
	timerManager?.clearAllTimers();

	// Process rules array for onTimer triggers
	const rules = config.get<Array<{
		trigger: string;
		message: string;
		duration?: number;
		timerType?: string;
		enabled?: boolean;
	}>>('rules', []);

	const timerRules = rules.filter(rule => rule.trigger === 'onTimer' && rule.enabled !== false);
	console.log(`[code-mantra] Starting ${timerRules.length} timer rules from rules array`);

	timerRules.forEach((rule, index) => {
		// Generate guaranteed unique ID using index
		const uniqueId = `timer-rule-${index}`;
		const notification: TimeBasedNotification = {
			duration: rule.duration || 25,
			message: rule.message,
			type: rule.timerType || 'custom',
			enabled: true,
			id: uniqueId
		};
		timerManager?.startTimer(notification, () => {
			showNotification(notification.message);
		});
	});

	// Also process old-style timeBasedNotifications config (for backward compatibility)
	if (!timeBasedEnabled) {
		console.log('[code-mantra] Time-based notifications are disabled');
		return;
	}

	const intervals = config.get<TimeBasedNotification[]>('timeBasedNotifications.intervals', []);
	if (!intervals || intervals.length === 0) {
		console.log('[code-mantra] No time-based notification intervals configured');
		return;
	}

	// 有効なタイマーのみを起動
	const enabledIntervals = intervals.filter(interval => interval.enabled);
	console.log(`[code-mantra] Starting ${enabledIntervals.length} time-based timers from legacy config`);

	enabledIntervals.forEach(interval => {
		timerManager?.startTimer(interval, () => {
			showNotification(interval.message);
		});
	});
}

function reinitializeTimers(): void {
	console.log('[code-mantra] Reinitializing timers');
	timerManager?.clearAllTimers();
	initializeTimers();
}

function handleTrigger(document: vscode.TextDocument): void {
	console.log(`[code-mantra] handleTrigger called for: ${document.uri.fsPath}`);

	if (!isExtensionEnabled()) {
		console.log('[code-mantra] Extension is disabled');
		return;
	}

	if (!shouldProcessDocument(document)) {
		console.log('[code-mantra] Document should not be processed');
		return;
	}

	const rules = getRules();
	console.log(`[code-mantra] Found ${rules.length} rules:`, rules);

	// Filter out onTimer rules (they are handled separately by TimerManager)
	const fileBasedRules = rules.filter(rule => rule.trigger !== 'onTimer');

	const matchingRules = fileBasedRules.filter(rule => {
		// 有効性チェック
		if (rule.enabled === false) {
			return false;
		}

		// ファイルパターンチェック
		if (!rule.filePattern) {
			return true; // パターンが指定されていない場合は全ファイル対象
		}

		const matches = matchesGlobPattern(document.uri.fsPath, rule.filePattern);
		console.log(`[code-mantra] Rule "${rule.message}" pattern "${rule.filePattern}" matches: ${matches}`);
		return matches;
	});
	console.log(`[code-mantra] ${matchingRules.length} matching rules`);

	if (matchingRules.length > 0) {
		const randomRule = matchingRules[Math.floor(Math.random() * matchingRules.length)];
		console.log(`[code-mantra] Selected rule:`, randomRule);
		showNotification(randomRule.message);
	} else {
		console.log('[code-mantra] No matching rules found');
	}
}

function isExtensionEnabled(): boolean {
	const config = vscode.workspace.getConfiguration('codeMantra');
	return config.get<boolean>('enabled', true);
}

function shouldProcessDocument(document: vscode.TextDocument): boolean {
	// ファイルタイプチェック
	const config = vscode.workspace.getConfiguration('codeMantra');
	const fileTypes = config.get<string[]>('fileTypes', []);

	if (!fileTypes.includes(document.languageId)) {
		console.log(`[code-mantra] Skipping document with language ID: ${document.languageId}`);
		return false;
	}

	// 除外パターンチェック
	const excludePatterns = config.get<string[]>('excludePatterns', []);
	const filePath = document.uri.fsPath;

	for (const pattern of excludePatterns) {
		if (matchesGlobPattern(filePath, pattern)) {
			console.log(`[code-mantra] Excluding file: ${filePath} (matched pattern: ${pattern})`);
			return false;
		}
	}

	return true;
}

// Glob pattern matching utilities
const DOUBLESTAR_PLACEHOLDER = '###DOUBLESTAR###';
const regexCache = new Map<string, RegExp>();

function matchesGlobPattern(filePath: string, pattern: string): boolean {
	// Simple glob pattern matching
	let regex = regexCache.get(pattern);

	if (!regex) {
		const regexPattern = pattern
			.replace(/\\/g, '/') // Windowsパス区切り文字を統一
			.replace(/\*\*/g, DOUBLESTAR_PLACEHOLDER)
			.replace(/\*/g, '[^/]*')
			.replace(new RegExp(DOUBLESTAR_PLACEHOLDER, 'g'), '.*')
			.replace(/\?/g, '.');

		regex = new RegExp(`^${regexPattern}$`);
		regexCache.set(pattern, regex);
	}

	const normalizedPath = filePath.replace(/\\/g, '/');
	const result = regex.test(normalizedPath);

	console.log(`[code-mantra] Pattern match: "${normalizedPath}" vs "${pattern}" = ${result}`);
	return result;
}

function getRules(): Rule[] {
	const config = vscode.workspace.getConfiguration('codeMantra');
	return config.get<Rule[]>('rules', []);
}

function shouldTriggerForFile(filePath: string, filePattern?: string): boolean {
	// If no pattern specified, trigger for all files
	if (!filePattern) {
		return true;
	}

	return matchesGlobPattern(filePath, filePattern);
}

function showNotification(message: string): void {
	console.log(`[code-mantra] Displaying notification: ${message}`);

	// 通知の表示を強制的に試行
	vscode.window.showInformationMessage(`🔔 Code Mantra: ${message}`).then(
		() => console.log(`[code-mantra] Notification displayed successfully`),
		(error) => console.error(`[code-mantra] Failed to display notification:`, error)
	);
}

/**
 * Handle onLargeDelete trigger events
 */
function handleLargeDelete(event: vscode.TextDocumentChangeEvent): void {
	const document = event.document;
	const filePath = document.uri.fsPath;

	// Skip processing if we're in the middle of a save operation
	if (suppressionManager?.isFileSaving(filePath)) {
		console.log('[code-mantra] Skipping onLargeDelete during save operation');
		return;
	}

	// Check if this trigger should be suppressed
	if (suppressionManager?.shouldSuppress(filePath, 'onLargeDelete')) {
		console.log('[code-mantra] Skipping onLargeDelete due to suppression');
		return;
	}

	// Update idle state on activity
	idleManager?.updateActivity();

	const rules = getRules().filter(
		rule => rule.trigger === 'onLargeDelete' && rule.enabled !== false
	);

	if (rules.length === 0) {
		return;
	}

	// Handle empty contentChanges (can occur on first event)
	if (event.contentChanges.length === 0) {
		console.log('[code-mantra] onLargeDelete: contentChanges is empty, skipping');
		return;
	}

	// Calculate total lines deleted in this change event
	// Only count actual deletions (not insertions or replacements)
	let totalLinesDeleted = 0;
	for (const change of event.contentChanges) {
		const startLine = change.range.start.line;
		const endLine = change.range.end.line;
		const rangeLines = endLine - startLine;

		// Count as deletion only if:
		// 1. Range spans multiple lines (rangeLines > 0)
		// 2. Replacement text has fewer lines than the range
		const newLines = change.text.split('\n').length - 1;

		if (rangeLines > 0 && newLines < rangeLines) {
			const linesDeleted = rangeLines - newLines;
			totalLinesDeleted += linesDeleted;
		}
	}

	if (totalLinesDeleted === 0) {
		return;
	}

	console.log(`[code-mantra] onLargeDelete: ${totalLinesDeleted} lines deleted in ${filePath}`);

	for (const rule of rules) {
		if (shouldTriggerForFile(filePath, rule.filePattern)) {
			const threshold = rule.deletionThreshold || 100;
			if (totalLinesDeleted >= threshold) {
				console.log(`[code-mantra] Large deletion detected: ${totalLinesDeleted} >= ${threshold}`);
				suppressionManager?.recordNotification(filePath, 'onLargeDelete');
				showNotification(rule.message);
			}
		}
	}
}

/**
 * Handle onFileSizeExceeded trigger events
 */
function handleFileSizeExceeded(event: vscode.TextDocumentChangeEvent): void {
	const document = event.document;
	const filePath = document.uri.fsPath;

	// Skip processing if we're in the middle of a save operation
	if (suppressionManager?.isFileSaving(filePath)) {
		console.log('[code-mantra] Skipping onFileSizeExceeded during save operation');
		return;
	}

	// Check if this trigger should be suppressed
	if (suppressionManager?.shouldSuppress(filePath, 'onFileSizeExceeded')) {
		console.log('[code-mantra] Skipping onFileSizeExceeded due to suppression');
		return;
	}

	const rules = getRules().filter(
		rule => rule.trigger === 'onFileSizeExceeded' && rule.enabled !== false
	);

	if (rules.length === 0) {
		return;
	}

	const currentLineCount = document.lineCount;
	const previousLineCount = suppressionManager?.getPreviousLineCount(filePath);

	console.log(`[code-mantra] onFileSizeExceeded: Line count: ${previousLineCount} -> ${currentLineCount} in ${filePath}`);

	for (const rule of rules) {
		if (shouldTriggerForFile(filePath, rule.filePattern)) {
			const threshold = rule.lineSizeThreshold || 300;
			const notifiedThresholds = notifiedFilesForSize.get(filePath) || new Set<number>();

			// Check if we crossed the threshold (previous < threshold, current >= threshold)
			const crossedThreshold = suppressionManager?.didCrossThreshold(filePath, currentLineCount, threshold);

			if (crossedThreshold && !notifiedThresholds.has(threshold)) {
				console.log(`[code-mantra] File size CROSSED threshold: ${previousLineCount} -> ${currentLineCount} (threshold: ${threshold})`);
				suppressionManager?.recordNotification(filePath, 'onFileSizeExceeded');
				showNotification(rule.message);
				notifiedThresholds.add(threshold);
				notifiedFilesForSize.set(filePath, notifiedThresholds);
			}
			// If line count fell below threshold, reset notification for this threshold
			else if (notifiedThresholds.has(threshold) && currentLineCount < threshold) {
				console.log(`[code-mantra] File size returned below threshold: ${currentLineCount} < ${threshold}`);
				notifiedThresholds.delete(threshold);
				if (notifiedThresholds.size === 0) {
					notifiedFilesForSize.delete(filePath);
				} else {
					notifiedFilesForSize.set(filePath, notifiedThresholds);
				}
			}
		}
	}

	// Update the line count tracking for next time
	suppressionManager?.updateLineCount(filePath, currentLineCount);
}
