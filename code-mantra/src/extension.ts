// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

interface NotificationRule {
	trigger: string;
	message: string;
	filePattern: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("[code-mantra] Extension is now active!");

	const disposable = vscode.commands.registerCommand(
		"code-mantra.helloWorld",
		() => {
			vscode.window.showInformationMessage("Hello World from code-mantra!");
		}
	);

	context.subscriptions.push(disposable);

	// ファイル保存イベントリスナーを登録
	const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
		console.log(`[code-mantra] File saved: ${document.fileName}`);

		if (!isExtensionEnabled()) {
			console.log("[code-mantra] Extension is disabled");
			return;
		}

		const rules = getRules();
		const matchingRules = rules.filter((rule) =>
			matchesPattern(document.fileName, rule.filePattern)
		);

		if (matchingRules.length > 0) {
			const randomRule =
				matchingRules[Math.floor(Math.random() * matchingRules.length)];
			console.log(`[code-mantra] Showing notification: ${randomRule.message}`);
			showNotification(randomRule.message);
		} else {
			console.log(`[code-mantra] No matching rules for: ${document.fileName}`);
		}
	});

	context.subscriptions.push(saveListener);
}

/**
 * 拡張機能が有効かチェックする
 * @returns 有効な場合true
 */
function isExtensionEnabled(): boolean {
	const config = vscode.workspace.getConfiguration("codeMantra");
	return config.get("enabled", true);
}

/**
 * ルール配列を取得する
 * @returns ルール配列
 */
function getRules(): NotificationRule[] {
	const config = vscode.workspace.getConfiguration("codeMantra");
	const rules = config.get("rules", []);
	console.log("[code-mantra] Retrieved rules:", JSON.stringify(rules));
	return rules;
}

/**
 * ファイルパスがパターンにマッチするかチェックする
 * @param filePath ファイルパス
 * @param pattern ファイルパターン（glob形式）
 * @returns マッチする場合true
 */
function matchesPattern(filePath: string, pattern: string): boolean {
	// パターンから拡張子リストを抽出
	// 例：**/*.{ts,js,tsx,jsx} → ['.ts', '.js', '.tsx', '.jsx']
	const extMatch = pattern.match(/\{([^}]+)\}/);
	if (!extMatch) {
		return false;
	}

	const extensions = extMatch[1].split(",").map((ext) => "." + ext.trim());
	const fileExtension = filePath.substring(filePath.lastIndexOf("."));

	console.log(
		`[code-mantra] Checking pattern: ${pattern}, file extension: ${fileExtension}`
	);

	return extensions.includes(fileExtension);
}

/**
 * 通知メッセージを表示する
 * @param message メッセージ
 */
function showNotification(message: string): void {
	vscode.window.showInformationMessage(message);
}

// This method is called when your extension is deactivated
export function deactivate() { }
