import * as vscode from 'vscode';

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
    private lastNotificationTime: number = 0;
    private readonly MIN_NOTIFICATION_INTERVAL = 3000; // 3秒間隔

    constructor(
        private context: vscode.ExtensionContext,
        private onTrigger: (document: vscode.TextDocument) => void
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
        return config.get<TriggersConfig>('triggers', {
            onSave: { enabled: true },
            onEdit: { enabled: false, delay: 5000 },
            onOpen: { enabled: false },
            onFocus: { enabled: false }
        });
    }

    private shouldShowNotification(): boolean {
        const now = Date.now();
        if (now - this.lastNotificationTime < this.MIN_NOTIFICATION_INTERVAL) {
            return false;
        }
        this.lastNotificationTime = now;
        return true;
    }

    private registerOnSave(): void {
        const listener = vscode.workspace.onDidSaveTextDocument((document) => {
            if (this.shouldShowNotification()) {
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
                if (this.shouldShowNotification()) {
                    this.onTrigger(event.document);
                }
            }, delay);
        });
        this.disposables.push(listener);
        console.log(`[code-mantra] onEdit trigger registered (delay: ${delay}ms)`);
    }

    private registerOnOpen(): void {
        const listener = vscode.workspace.onDidOpenTextDocument((document) => {
            if (this.shouldShowNotification()) {
                this.onTrigger(document);
            }
        });
        this.disposables.push(listener);
        console.log('[code-mantra] onOpen trigger registered');
    }

    private registerOnFocus(): void {
        const listener = vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && this.shouldShowNotification()) {
                this.onTrigger(editor.document);
            }
        });
        this.disposables.push(listener);
        console.log('[code-mantra] onFocus trigger registered');
    }
}
