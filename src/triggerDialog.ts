import * as vscode from 'vscode';
import { TriggerRule } from './triggerTreeView';

export class TriggerDialog {
    static async showAddDialog(): Promise<TriggerRule | undefined> {
        // トリガータイプを選択
        const triggerType = await vscode.window.showQuickPick([
            { label: '💾 On Save (onSave)', value: 'onSave' as const, description: 'Show notification when a file is saved' },
            { label: '✏️ On Edit (onEdit)', value: 'onEdit' as const, description: 'Show notification after editing with debounce' },
            { label: '📂 On Open (onOpen)', value: 'onOpen' as const, description: 'Show notification when a file is opened' },
            { label: '🎯 On Focus (onFocus)', value: 'onFocus' as const, description: 'Show notification when editor gains focus' },
            { label: '⏰ Timer (onTimer)', value: 'onTimer' as const, description: 'Show notification at regular time intervals' }
        ], {
            placeHolder: 'Select a trigger type',
            title: 'Add New Trigger'
        });

        if (!triggerType) {
            return undefined;
        }

        // For timer triggers, ask for duration and type
        if (triggerType.value === 'onTimer') {
            const timerTypeChoice = await vscode.window.showQuickPick([
                { label: '🍅 Pomodoro (25 min)', value: 'pomodoro' as const, duration: 25 },
                { label: '💼 Work Break (50 min)', value: 'workBreak' as const, duration: 50 },
                { label: '⚙️ Custom Duration', value: 'custom' as const, duration: 0 }
            ], {
                placeHolder: 'Select timer type',
                title: 'Timer Type'
            });

            if (!timerTypeChoice) {
                return undefined;
            }

            let duration = timerTypeChoice.duration;
            if (timerTypeChoice.value === 'custom') {
                const durationInput = await vscode.window.showInputBox({
                    prompt: 'Enter duration in minutes (1-120)',
                    placeHolder: 'e.g. 25',
                    validateInput: (value) => {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 1 || num > 120) {
                            return 'Please enter a number between 1 and 120';
                        }
                        return null;
                    }
                });

                if (!durationInput) {
                    return undefined;
                }
                duration = parseInt(durationInput);
            }

            const message = await vscode.window.showInputBox({
                prompt: 'Enter notification message',
                placeHolder: 'e.g. Time to take a break!',
                value: timerTypeChoice.value === 'pomodoro' ? '🍅 Pomodoro complete! Take a short break.' :
                    timerTypeChoice.value === 'workBreak' ? '💡 Time to take a break! Step away from your screen.' : '',
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

            return {
                trigger: 'onTimer',
                message: message.trim(),
                duration,
                timerType: timerTypeChoice.value,
                enabled: true
            };
        }

        // For file-based triggers
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
            { label: '🎯 フォーカス時 (onFocus)', value: 'onFocus' as const, description: 'エディタがフォーカスされた時に通知を表示' },
            { label: '⏰ タイマー (onTimer)', value: 'onTimer' as const, description: '定期的な時間間隔で通知を表示' }
        ];

        const currentTriggerIndex = triggerOptions.findIndex(opt => opt.value === existingRule.trigger);

        const triggerType = await vscode.window.showQuickPick(triggerOptions, {
            placeHolder: 'Select a trigger type',
            title: 'Edit Trigger'
        });

        if (!triggerType) {
            return undefined;
        }

        // For timer triggers, edit duration and type
        if (triggerType.value === 'onTimer') {
            const currentDuration = existingRule.duration || 25;
            const durationInput = await vscode.window.showInputBox({
                prompt: 'Edit duration in minutes (1-120)',
                placeHolder: 'e.g. 25',
                value: currentDuration.toString(),
                validateInput: (value) => {
                    const num = parseInt(value);
                    if (isNaN(num) || num < 1 || num > 120) {
                        return 'Please enter a number between 1 and 120';
                    }
                    return null;
                }
            });

            if (!durationInput) {
                return undefined;
            }

            const duration = parseInt(durationInput);

            const message = await vscode.window.showInputBox({
                prompt: 'Edit notification message',
                placeHolder: 'e.g. Time to take a break!',
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

            return {
                trigger: 'onTimer',
                message: message.trim(),
                duration,
                timerType: existingRule.timerType || 'custom',
                enabled: existingRule.enabled
            };
        }

        // For file-based triggers
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
