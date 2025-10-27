import * as vscode from 'vscode';
import { TriggerRule } from './triggerTreeView';

export class TriggerDialog {
    /**
     * Show input box with validation and retry on invalid input
     */
    private static async showInputBoxWithRetry(
        options: vscode.InputBoxOptions,
        validator: (value: string) => string | null
    ): Promise<string | undefined> {
        while (true) {
            const input = await vscode.window.showInputBox(options);
            
            if (input === undefined) {
                // User cancelled
                return undefined;
            }

            const errorMessage = validator(input);
            if (errorMessage === null) {
                // Valid input
                return input;
            }

            // Show error message and retry
            const retry = await vscode.window.showWarningMessage(
                errorMessage,
                'Retry',
                'Cancel'
            );

            if (retry !== 'Retry') {
                return undefined;
            }
            // Loop continues to show input box again
        }
    }

    static async showAddDialog(): Promise<TriggerRule | undefined> {
        console.log('[code-mantra] TriggerDialog.showAddDialog() called');
        // Select trigger type
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
                const durationInput = await this.showInputBoxWithRetry(
                    {
                        prompt: 'Enter duration in minutes (1-120)',
                        placeHolder: 'e.g. 25'
                    },
                    (value) => {
                        // Check if input is empty
                        if (!value || value.trim().length === 0) {
                            return 'Duration cannot be empty. Please enter a number between 1 and 120.';
                        }
                        // Check if input contains only digits
                        if (!/^\d+$/.test(value.trim())) {
                            return 'Invalid input. Please enter only numbers (no letters or special characters).';
                        }
                        const num = parseInt(value.trim());
                        if (isNaN(num) || num < 1 || num > 120) {
                            return 'Duration must be between 1 and 120 minutes.';
                        }
                        return null;
                    }
                );

                if (!durationInput) {
                    return undefined;
                }
                duration = parseInt(durationInput.trim());
            }

            const defaultMessage = timerTypeChoice.value === 'pomodoro' ? '🍅 Pomodoro complete! Take a short break.' :
                timerTypeChoice.value === 'workBreak' ? '💡 Time to take a break! Step away from your screen.' : '';
            
            const message = await this.showInputBoxWithRetry(
                {
                    prompt: 'Enter notification message',
                    placeHolder: 'e.g. Time to take a break!',
                    value: defaultMessage
                },
                (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Message cannot be empty. Please enter a notification message.';
                    }
                    return null;
                }
            );

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
        // Enter message
        const message = await this.showInputBoxWithRetry(
            {
                prompt: 'Enter notification message',
                placeHolder: 'e.g. ETC? (Easier To Change?)'
            },
            (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Message cannot be empty. Please enter a notification message.';
                }
                return null;
            }
        );

        if (!message) {
            return undefined;
        }

        // Enter file pattern
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
        // Select trigger type
        const triggerOptions = [
            { label: '💾 On Save (onSave)', value: 'onSave' as const, description: 'Show notification when a file is saved' },
            { label: '✏️ On Edit (onEdit)', value: 'onEdit' as const, description: 'Show notification after editing with debounce' },
            { label: '📂 On Open (onOpen)', value: 'onOpen' as const, description: 'Show notification when a file is opened' },
            { label: '🎯 On Focus (onFocus)', value: 'onFocus' as const, description: 'Show notification when editor gains focus' },
            { label: '⏰ Timer (onTimer)', value: 'onTimer' as const, description: 'Show notification at regular time intervals' }
        ];

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
            const durationInput = await this.showInputBoxWithRetry(
                {
                    prompt: 'Edit duration in minutes (1-120)',
                    placeHolder: 'e.g. 25',
                    value: currentDuration.toString()
                },
                (value) => {
                    // Check if input is empty
                    if (!value || value.trim().length === 0) {
                        return 'Duration cannot be empty. Please enter a number between 1 and 120.';
                    }
                    // Check if input contains only digits
                    if (!/^\d+$/.test(value.trim())) {
                        return 'Invalid input. Please enter only numbers (no letters or special characters).';
                    }
                    const num = parseInt(value.trim());
                    if (isNaN(num) || num < 1 || num > 120) {
                        return 'Duration must be between 1 and 120 minutes.';
                    }
                    return null;
                }
            );

            if (!durationInput) {
                return undefined;
            }

            const duration = parseInt(durationInput.trim());

            const message = await this.showInputBoxWithRetry(
                {
                    prompt: 'Edit notification message',
                    placeHolder: 'e.g. Time to take a break!',
                    value: existingRule.message
                },
                (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Message cannot be empty. Please enter a notification message.';
                    }
                    return null;
                }
            );

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
        // Edit message
        const message = await this.showInputBoxWithRetry(
            {
                prompt: 'Edit notification message',
                placeHolder: 'e.g. ETC? (Easier To Change?)',
                value: existingRule.message
            },
            (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Message cannot be empty. Please enter a notification message.';
                }
                return null;
            }
        );

        if (!message) {
            return undefined;
        }

        // Edit file pattern
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
