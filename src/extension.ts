import * as vscode from 'vscode';
import { TriggerManager } from './triggerManager';

let triggerManager: TriggerManager | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('[code-mantra] Extension activated');

	// TriggerManagerを初期化
	triggerManager = new TriggerManager(context, handleTrigger);
	triggerManager.activate();

	// 設定変更時に再初期化
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration('codeMantra')) {
				console.log('[code-mantra] Configuration changed, reactivating triggers');
				triggerManager?.deactivate();
				triggerManager = new TriggerManager(context, handleTrigger);
				triggerManager.activate();
			}
		})
	);
}

export function deactivate() {
	triggerManager?.deactivate();
	console.log('[code-mantra] Extension deactivated');
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
