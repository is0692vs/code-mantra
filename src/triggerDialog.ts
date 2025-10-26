import * as vscode from 'vscode';
import { TriggerRule } from './triggerTreeView';

export class TriggerDialog {
    static async showAddDialog(): Promise<TriggerRule | undefined> {
        // トリガータイプを選択
        const triggerType = await vscode.window.showQuickPick([
            { label: '💾 On Save (onSave)', value: 'onSave' as const, description: 'Show notification when a file is saved' },
            { label: '✏️ On Edit (onEdit)', value: 'onEdit' as const, description: 'Show notification after editing with debounce' },
            { label: '📂 On Open (onOpen)', value: 'onOpen' as const, description: 'Show notification when a file is opened' },
            { label: '🎯 On Focus (onFocus)', value: 'onFocus' as const, description: 'Show notification when editor gains focus' }
        ], {
            placeHolder: 'Select a trigger type',
            title: 'Add New Trigger'
        });

        if (!triggerType) {
            return undefined;
        }

        // メッセージを入力
        const message = await vscode.window.showInputBox({
            prompt: 'Enter notification message',
            placeHolder: 'e.g. ETC? (Easier To Change?)',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Please enter a message';
                }
                return null;
            }
        });

        if (!message) {
            return undefined;
        }

        // ファイルパターンを入力
        const filePattern = await vscode.window.showInputBox({
            prompt: 'Enter a file glob pattern (optional)',
            placeHolder: 'e.g. **/*.{ts,js,tsx,jsx} or leave blank for all files',
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
            placeHolder: 'Select a trigger type',
            title: 'Edit Trigger'
        });

        if (!triggerType) {
            return undefined;
        }

        // メッセージを編集
        const message = await vscode.window.showInputBox({
            prompt: 'Edit notification message',
            placeHolder: 'e.g. ETC? (Easier To Change?)',
            value: existingRule.message,
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Please enter a message';
                }
                return null;
            }
        });

        if (!message) {
            return undefined;
        }

        // ファイルパターンを編集
        const filePattern = await vscode.window.showInputBox({
            prompt: 'Edit file glob pattern (optional)',
            placeHolder: 'e.g. **/*.{ts,js,tsx,jsx} or leave blank for all files',
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
            `Are you sure you want to delete trigger "${message}"?`,
            { modal: true },
            'Delete',
            'Cancel'
        );

        return result === 'Delete';
    }
}
