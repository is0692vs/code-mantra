// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-mantra" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand(
		"code-mantra.helloWorld",
		() => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			vscode.window.showInformationMessage("Hello World from code-mantra!");
		}
	);

	context.subscriptions.push(disposable);

	// ファイル保存イベントリスナーを登録
	const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
		console.log(`[code-mantra] File saved: ${document.fileName}`);
		if (shouldShowNotification(document)) {
			console.log(`[code-mantra] Showing notification for: ${document.fileName}`);
			showMantraNotification();
		} else {
			console.log(`[code-mantra] Skipping notification for: ${document.fileName}`);
		}
	});

	context.subscriptions.push(saveListener);
}

/**
 * 通知を表示すべきかどうかを判定する
 * @param document 保存されたテキストドキュメント
 * @returns 通知を表示すべき場合true
 */
function shouldShowNotification(document: vscode.TextDocument): boolean {
	// 対象拡張子のリスト
	const targetExtensions = [
		".ts",
		".js",
		".tsx",
		".jsx",
		".py",
		".java",
		".go",
		".rs",
		".cpp",
		".c",
		".cs",
	];

	// ファイルパスから拡張子を取得
	const filePath = document.fileName;
	const extension = filePath.substring(filePath.lastIndexOf("."));

	console.log(`[code-mantra] Checking extension: ${extension}`);

	// 対象拡張子に含まれているかチェック
	return targetExtensions.includes(extension);
}

/**
 * マントラ通知を表示する
 */
function showMantraNotification(): void {
	console.log("[code-mantra] Displaying notification: ETC? (Easier To Change?)");
	vscode.window.showInformationMessage("ETC? (Easier To Change?)");
}

// This method is called when your extension is deactivated
export function deactivate() { }
