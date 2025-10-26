import * as vscode from 'vscode';
import { TriggerRule } from './triggerTreeView';

export class TriggerDialog {
    static async showAddDialog(): Promise<TriggerRule | undefined> {
        // トリガータイプを選択
        const triggerType = await vscode.window.showQuickPick([
            { label: '💾 保存時 (onSave)', value: 'onSave' as const, description: 'ファイル保存時に通知を表示' },
            { label: '✏️ 編集時 (onEdit)', value: 'onEdit' as const, description: '編集後に遅延して通知を表示' },
            { label: '📂 開く時 (onOpen)', value: 'onOpen' as const, description: 'ファイルを開いた時に通知を表示' },
            { label: '🎯 フォーカス時 (onFocus)', value: 'onFocus' as const, description: 'エディタがフォーカスされた時に通知を表示' }
        ], {
            placeHolder: 'トリガータイプを選択してください',
            title: '新しいトリガーを追加'
        });

        if (!triggerType) {
            return undefined;
        }

        // メッセージを入力
        const message = await vscode.window.showInputBox({
            prompt: '通知メッセージを入力してください',
            placeHolder: '例: ETC? (Easier To Change?)',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'メッセージを入力してください';
                }
                return null;
            }
        });

        if (!message) {
            return undefined;
        }

        // ファイルパターンを入力
        const filePattern = await vscode.window.showInputBox({
            prompt: 'ファイルパターンを入力してください (オプション)',
            placeHolder: '例: **/*.{ts,js,tsx,jsx} または 空白で全てのファイル対象',
            value: ''
        });

        return {
            trigger: triggerType.value,
            message: message.trim(),
            filePattern: filePattern?.trim() || undefined,
            enabled: true
        };
    }

    static async showEditDialog(existingRule: TriggerRule): Promise<TriggerRule | undefined> {
        // トリガータイプを選択
        const triggerOptions = [
            { label: '💾 保存時 (onSave)', value: 'onSave' as const, description: 'ファイル保存時に通知を表示' },
            { label: '✏️ 編集時 (onEdit)', value: 'onEdit' as const, description: '編集後に遅延して通知を表示' },
            { label: '📂 開く時 (onOpen)', value: 'onOpen' as const, description: 'ファイルを開いた時に通知を表示' },
            { label: '🎯 フォーカス時 (onFocus)', value: 'onFocus' as const, description: 'エディタがフォーカスされた時に通知を表示' }
        ];

        const currentTriggerIndex = triggerOptions.findIndex(opt => opt.value === existingRule.trigger);

        const triggerType = await vscode.window.showQuickPick(triggerOptions, {
            placeHolder: 'トリガータイプを選択してください',
            title: 'トリガーを編集'
        });

        if (!triggerType) {
            return undefined;
        }

        // メッセージを編集
        const message = await vscode.window.showInputBox({
            prompt: '通知メッセージを編集してください',
            placeHolder: '例: ETC? (Easier To Change?)',
            value: existingRule.message,
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'メッセージを入力してください';
                }
                return null;
            }
        });

        if (!message) {
            return undefined;
        }

        // ファイルパターンを編集
        const filePattern = await vscode.window.showInputBox({
            prompt: 'ファイルパターンを編集してください (オプション)',
            placeHolder: '例: **/*.{ts,js,tsx,jsx} または 空白で全てのファイル対象',
            value: existingRule.filePattern || ''
        });

        return {
            trigger: triggerType.value,
            message: message.trim(),
            filePattern: filePattern?.trim() || undefined,
            enabled: existingRule.enabled
        };
    }

    static async confirmDelete(message: string): Promise<boolean> {
        const result = await vscode.window.showWarningMessage(
            `トリガー「${message}」を削除してもよろしいですか?`,
            { modal: true },
            '削除',
            'キャンセル'
        );

        return result === '削除';
    }
}
