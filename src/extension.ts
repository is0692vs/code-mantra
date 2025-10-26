import * as vscode from 'vscode';
import { TriggerManager } from './triggerManager';
import { TimerManager, TimeBasedNotification } from './timerManager';

let triggerManager: TriggerManager | undefined;
let timerManager: TimerManager | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('[code-mantra] Extension activated');

	// TriggerManagerを初期化
	triggerManager = new TriggerManager(context, handleTrigger);
	triggerManager.activate();

	// TimerManagerを初期化
	timerManager = new TimerManager();
	initializeTimers();

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
	const timeBasedConfig = config.get<any>('timeBasedNotifications');
	
	if (timeBasedConfig?.enabled && timeBasedConfig?.resetOn) {
		const resetEvents = timeBasedConfig.resetOn as string[];
		
		if (resetEvents.includes('save')) {
			context.subscriptions.push(
				vscode.workspace.onDidSaveTextDocument(() => {
					console.log('[code-mantra] File saved, resetting timers');
					reinitializeTimers();
				})
			);
		}

		if (resetEvents.includes('focus')) {
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
	const timeBasedConfig = config.get<any>('timeBasedNotifications');

	if (!timeBasedConfig?.enabled) {
		console.log('[code-mantra] Time-based notifications are disabled');
		return;
	}

	const intervals = timeBasedConfig.intervals as TimeBasedNotification[];
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
	if (!isExtensionEnabled()) {
		return;
	}

	if (!shouldProcessDocument(document)) {
		return;
	}

	const rules = getRules();
	const matchingRules = rules.filter(() => true); // 全ルールを対象（filePatternチェックは削除）

	if (matchingRules.length > 0) {
		const randomRule = matchingRules[Math.floor(Math.random() * matchingRules.length)];
		showNotification(randomRule.message);
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
		.replace(/\*\*/g, '.*')
		.replace(/\*/g, '[^/]*')
		.replace(/\?/g, '.');

	const regex = new RegExp(regexPattern);
	return regex.test(filePath);
}

function getRules(): Array<{ trigger: string, message: string, filePattern: string }> {
	const config = vscode.workspace.getConfiguration('codeMantra');
	return config.get<Array<{ trigger: string, message: string, filePattern: string }>>('rules', []);
}

function showNotification(message: string): void {
	console.log(`[code-mantra] Displaying notification: ${message}`);
	vscode.window.showInformationMessage(message);
}
