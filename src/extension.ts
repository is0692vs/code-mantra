import * as vscode from 'vscode';
import { TriggerManager } from './triggerManager';
import { TimerManager, TimeBasedNotification } from './timerManager';
import { TriggerTreeDataProvider, TriggerTreeItem } from './triggerTreeView';
import { TriggerDialog } from './triggerDialog';

let triggerManager: TriggerManager | undefined;
let timerManager: TimerManager | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('[code-mantra] Extension activated');

	// 設定の初期状態をログ出力
	const initialConfig = vscode.workspace.getConfiguration('codeMantra');
	console.log('[code-mantra] Current configuration:', {
		enabled: initialConfig.get('enabled'),
		'triggers.onSave.enabled': initialConfig.get('triggers.onSave.enabled'),
		'triggers.onEdit.enabled': initialConfig.get('triggers.onEdit.enabled'),
		'triggers.onOpen.enabled': initialConfig.get('triggers.onOpen.enabled'),
		'triggers.onFocus.enabled': initialConfig.get('triggers.onFocus.enabled'),
		rules: initialConfig.get('rules')
	});

	// TriggerManagerを初期化
	triggerManager = new TriggerManager(context, handleTrigger);
	triggerManager.activate();

	// TimerManagerを初期化
	timerManager = new TimerManager();
	initializeTimers();

	// TreeViewの初期化
	const triggerTreeDataProvider = new TriggerTreeDataProvider(context);
	const treeView = vscode.window.createTreeView('codeMantraTriggers', {
		treeDataProvider: triggerTreeDataProvider,
		showCollapseAll: false,
		canSelectMany: false
	});
	context.subscriptions.push(treeView);

	// チェックボックスの状態変更を処理
	treeView.onDidChangeCheckboxState(async (e) => {
		for (const [item] of e.items) {
			if (item instanceof TriggerTreeItem) {
				await triggerTreeDataProvider.toggleTrigger(item.index);
			}
		}
	});

	// Hello World コマンド（デバッグ用）
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.helloWorld', () => {
			console.log('[code-mantra] Hello World command executed');
			vscode.window.showInformationMessage('🔔 Hello World from Code Mantra!');
		})
	);

	// Test Notification コマンド（デバッグ用）
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

	// トリガー追加コマンド
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.addTrigger', async () => {
			const newTrigger = await TriggerDialog.showAddDialog();
			if (newTrigger) {
				await triggerTreeDataProvider.addTrigger(newTrigger);
			}
		})
	);

	// トリガー編集コマンド
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.editTrigger', async (item: TriggerTreeItem) => {
			const updatedTrigger = await TriggerDialog.showEditDialog(item.rule);
			if (updatedTrigger) {
				await triggerTreeDataProvider.updateTrigger(item.index, updatedTrigger);
			}
		})
	);

	// トリガー削除コマンド
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.deleteTrigger', async (item: TriggerTreeItem) => {
			const confirmed = await TriggerDialog.confirmDelete(item.rule.message);
			if (confirmed) {
				await triggerTreeDataProvider.deleteTrigger(item.index);
			}
		})
	);

	// トリガー有効/無効切り替えコマンド
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.toggleTrigger', async (item: TriggerTreeItem) => {
			await triggerTreeDataProvider.toggleTrigger(item.index);
		})
	);

	// トリガーを上に移動コマンド
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.moveTriggerUp', async (item: TriggerTreeItem) => {
			await triggerTreeDataProvider.moveUp(item.index);
		})
	);

	// トリガーを下に移動コマンド
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.moveTriggerDown', async (item: TriggerTreeItem) => {
			await triggerTreeDataProvider.moveDown(item.index);
		})
	);

	// トリガー更新コマンド
	context.subscriptions.push(
		vscode.commands.registerCommand('code-mantra.refreshTriggers', () => {
			triggerTreeDataProvider.refresh();
		})
	);

	// 設定変更時に再初期化
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
			}

			if (event.affectsConfiguration('codeMantra.timeBasedNotifications')) {
				console.log('[code-mantra] Time-based notification configuration changed');
				reinitializeTimers();
			}
		})
	);

	// タイマーリセットイベントの登録
	const config = vscode.workspace.getConfiguration('codeMantra');
	const timeBasedEnabled = config.get<boolean>('timeBasedNotifications.enabled', true);
	const resetOn = config.get<string[]>('timeBasedNotifications.resetOn', ['save']);

	if (timeBasedEnabled && resetOn) {
		if (resetOn.includes('save')) {
			context.subscriptions.push(
				vscode.workspace.onDidSaveTextDocument(() => {
					console.log('[code-mantra] File saved, resetting timers');
					reinitializeTimers();
				})
			);
		}

		if (resetOn.includes('focus')) {
			context.subscriptions.push(
				vscode.window.onDidChangeWindowState((state) => {
					if (state.focused) {
						console.log('[code-mantra] Window focused, resetting timers');
						reinitializeTimers();
					}
				})
			);
		}
	}

	// TimerManagerのクリーンアップを登録
	context.subscriptions.push({
		dispose: () => timerManager?.dispose()
	});
}

export function deactivate() {
	triggerManager?.deactivate();
	timerManager?.dispose();
	console.log('[code-mantra] Extension deactivated');
}

function initializeTimers(): void {
	const config = vscode.workspace.getConfiguration('codeMantra');
	const timeBasedEnabled = config.get<boolean>('timeBasedNotifications.enabled', true);

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
	console.log(`[code-mantra] Starting ${enabledIntervals.length} time-based timers`);

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

	const matchingRules = rules.filter(rule => {
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

function matchesGlobPattern(filePath: string, pattern: string): boolean {
	// 簡易的なglobパターンマッチング
	const regexPattern = pattern
		.replace(/\\/g, '/') // Windowsパス区切り文字を統一
		.replace(/\*\*/g, '###DOUBLESTAR###')
		.replace(/\*/g, '[^/]*')
		.replace(/###DOUBLESTAR###/g, '.*')
		.replace(/\?/g, '.');

	const normalizedPath = filePath.replace(/\\/g, '/');
	const regex = new RegExp(`^${regexPattern}$`);
	const result = regex.test(normalizedPath);
	
	console.log(`[code-mantra] Pattern match: "${normalizedPath}" vs "${regexPattern}" = ${result}`);
	return result;
}

function getRules(): Array<{ trigger: string, message: string, filePattern?: string, enabled?: boolean }> {
	const config = vscode.workspace.getConfiguration('codeMantra');
	return config.get<Array<{ trigger: string, message: string, filePattern?: string, enabled?: boolean }>>('rules', []);
}

function showNotification(message: string): void {
	console.log(`[code-mantra] Displaying notification: ${message}`);
	
	// 通知の表示を強制的に試行
	vscode.window.showInformationMessage(`🔔 Code Mantra: ${message}`).then(
		() => console.log(`[code-mantra] Notification displayed successfully`),
		(error) => console.error(`[code-mantra] Failed to display notification:`, error)
	);
}
