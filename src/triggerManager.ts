import * as vscode from 'vscode';
import { SuppressionManager } from './suppressionManager';

export interface TriggerConfig {
    enabled: boolean;
    delay?: number;
}

export interface TriggersConfig {
    onSave: TriggerConfig;
    onEdit: TriggerConfig;
    onOpen: TriggerConfig;
    onFocus: TriggerConfig;
}

export class TriggerManager {
    private disposables: vscode.Disposable[] = [];
    private editDebounceTimer: NodeJS.Timeout | undefined;
    // Track last notification time per trigger type per file
    private lastNotificationTimes = new Map<string, Map<string, number>>();
    private readonly MIN_NOTIFICATION_INTERVAL = 1000; // 1 second minimum interval (short for debugging)

    constructor(
        private context: vscode.ExtensionContext,
        private onTrigger: (document: vscode.TextDocument) => void,
        private suppressionManager?: SuppressionManager
    ) { }

    public activate(): void {
        const config = this.getTriggersConfig();

        if (config.onSave.enabled) {
            this.registerOnSave();
        }

        if (config.onEdit.enabled) {
            this.registerOnEdit(config.onEdit.delay || 5000);
        }

        if (config.onOpen.enabled) {
            this.registerOnOpen();
        }

        if (config.onFocus.enabled) {
            this.registerOnFocus();
        }
    }

    public deactivate(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];

        if (this.editDebounceTimer) {
            clearTimeout(this.editDebounceTimer);
        }
    }

    private getTriggersConfig(): TriggersConfig {
        const config = vscode.workspace.getConfiguration('codeMantra');

        // 新しいフラットな設定構造から読み取り
        return {
            onSave: {
                enabled: config.get<boolean>('triggers.onSave.enabled', true)
            },
            onEdit: {
                enabled: config.get<boolean>('triggers.onEdit.enabled', false),
                delay: config.get<number>('triggers.onEdit.delay', 5000)
            },
            onOpen: {
                enabled: config.get<boolean>('triggers.onOpen.enabled', false)
            },
            onFocus: {
                enabled: config.get<boolean>('triggers.onFocus.enabled', false)
            }
        };
    }

    private shouldShowNotification(filePath: string, triggerType: string): boolean {
        const now = Date.now();

        // Check suppression manager first
        if (this.suppressionManager?.shouldSuppress(filePath, triggerType)) {
            console.log(`[TriggerManager] ${triggerType} suppressed by SuppressionManager for ${filePath}`);
            return false;
        }

        // Check per-file per-trigger throttling
        let fileNotifications = this.lastNotificationTimes.get(filePath);
        if (!fileNotifications) {
            fileNotifications = new Map<string, number>();
            this.lastNotificationTimes.set(filePath, fileNotifications);
        }

        const lastTime = fileNotifications.get(triggerType) || 0;
        const timeSinceLastNotification = now - lastTime;

        console.log(`[TriggerManager] ${triggerType} throttle check for ${filePath}: ${timeSinceLastNotification}ms since last (min: ${this.MIN_NOTIFICATION_INTERVAL}ms)`);

        if (timeSinceLastNotification < this.MIN_NOTIFICATION_INTERVAL) {
            console.log(`[TriggerManager] ${triggerType} throttled for ${filePath}`);
            return false;
        }

        fileNotifications.set(triggerType, now);

        // Record in suppression manager
        this.suppressionManager?.recordNotification(filePath, triggerType);

        return true;
    }

    private registerOnSave(): void {
        const listener = vscode.workspace.onDidSaveTextDocument((document) => {
            const filePath = document.uri.fsPath;
            console.log(`[code-mantra] onSave event triggered for: ${filePath}`);
            if (this.shouldShowNotification(filePath, 'onSave')) {
                this.onTrigger(document);
            }
        });
        this.disposables.push(listener);
        console.log('[code-mantra] onSave trigger registered');
    }

    private registerOnEdit(delay: number): void {
        const listener = vscode.workspace.onDidChangeTextDocument((event) => {
            if (this.editDebounceTimer) {
                clearTimeout(this.editDebounceTimer);
            }

            this.editDebounceTimer = setTimeout(() => {
                const filePath = event.document.uri.fsPath;
                if (this.shouldShowNotification(filePath, 'onEdit')) {
                    this.onTrigger(event.document);
                }
            }, delay);
        });
        this.disposables.push(listener);
        console.log(`[code-mantra] onEdit trigger registered (delay: ${delay}ms)`);
    }

    private registerOnOpen(): void {
        const listener = vscode.workspace.onDidOpenTextDocument((document) => {
            const filePath = document.uri.fsPath;
            if (this.shouldShowNotification(filePath, 'onOpen')) {
                this.onTrigger(document);
            }
        });
        this.disposables.push(listener);
        console.log('[code-mantra] onOpen trigger registered');
    }

    private registerOnFocus(): void {
        const listener = vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                const filePath = editor.document.uri.fsPath;
                if (this.shouldShowNotification(filePath, 'onFocus')) {
                    this.onTrigger(editor.document);
                }
            }
        });
        this.disposables.push(listener);
        console.log('[code-mantra] onFocus trigger registered');
    }

    /**
     * Handle workspace open trigger (shows on activation)
     */
    handleWorkspaceOpen(): void {
        const rules = this.getRules().filter(
            rule => rule.trigger === 'onWorkspaceOpen' && rule.enabled !== false
        );

        if (rules.length > 0) {
            console.log(`[code-mantra] Executing ${rules.length} onWorkspaceOpen rules`);
            rules.forEach(rule => {
                this.showNotification(rule.message);
            });
            console.log('[code-mantra] onWorkspaceOpen trigger executed');
        }
    }

    private getRules(): Array<{ trigger: string, message: string, filePattern?: string, enabled?: boolean }> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        return config.get<Array<{ trigger: string, message: string, filePattern?: string, enabled?: boolean }>>('rules', []);
    }

    private showNotification(message: string): void {
        console.log(`[code-mantra] Displaying notification: ${message}`);

        // 通知の表示を強制的に試行
        vscode.window.showInformationMessage(`🔔 Code Mantra: ${message}`).then(
            () => console.log(`[code-mantra] Notification displayed successfully`),
            (error) => console.error(`[code-mantra] Failed to display notification:`, error)
        );
    }
}
