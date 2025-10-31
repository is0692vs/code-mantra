import * as vscode from 'vscode';

export interface TriggerRule {
    trigger: 'onSave' | 'onEdit' | 'onOpen' | 'onFocus' | 'onWorkspaceOpen' | 'onTimer' | 'onCreate' | 'onDelete' | 'onLargeDelete' | 'onFileSizeExceeded' | 'onIdle';
    message: string;
    filePattern?: string;
    enabled?: boolean;
    duration?: number; // duration in minutes (only for onTimer)
    timerType?: 'workBreak' | 'pomodoro' | 'custom'; // timer type (only for onTimer)
    deletionThreshold?: number; // deletion threshold in lines (only for onLargeDelete)
    lineSizeThreshold?: number; // file size threshold in lines (only for onFileSizeExceeded)
    idleDuration?: number; // Duration in minutes for idle detection (default: 15)
}

export class TriggerTreeItem extends vscode.TreeItem {
    constructor(
        public readonly rule: TriggerRule,
        public readonly index: number,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(rule.message, collapsibleState);

        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.iconPath = this.getIcon();
        this.contextValue = 'triggerRule';

        // Set checkbox state
        this.checkboxState = {
            state: rule.enabled !== false ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked,
            tooltip: rule.enabled !== false ? 'Disable trigger' : 'Enable trigger'
        };
    }

    private getTooltip(): string {
        const status = this.rule.enabled !== false ? '✅ Enabled' : '❌ Disabled';
        if (this.rule.trigger === 'onWorkspaceOpen') {
            return `${status}\nTrigger: Workspace Open\nShows once when VS Code starts`;
        }
        if (this.rule.trigger === 'onIdle') {
            const idleMinutes = this.rule.idleDuration || 15;
            return `${status}\nTrigger: Idle Detection\nShows after ${idleMinutes} minutes of inactivity`;
        }
        if (this.rule.trigger === 'onTimer') {
            const duration = this.rule.duration || 25;
            const type = this.rule.timerType || 'custom';
            return `${status}\nTrigger: Time-based (every ${duration} min)\nType: ${type}`;
        }
        if (this.rule.trigger === 'onLargeDelete') {
            const threshold = this.rule.deletionThreshold || 100;
            return `${status}\nTrigger: Large Delete (${threshold}+ lines)`;
        }
        if (this.rule.trigger === 'onFileSizeExceeded') {
            const threshold = this.rule.lineSizeThreshold || 300;
            return `${status}\nTrigger: File Size Exceeded (${threshold}+ lines)`;
        }
        const pattern = this.rule.filePattern || '**/*.*';
        return `${status}\nTrigger: ${this.rule.trigger}\nPattern: ${pattern}`;
    }

    private getDescription(): string {
        if (this.rule.trigger === 'onTimer') {
            const duration = this.rule.duration || 25;
            return `${this.getTriggerLabel()} • Every ${duration} min`;
        }
        if (this.rule.trigger === 'onIdle') {
            const minutes = this.rule.idleDuration || 15;
            return `${this.getTriggerLabel()} • After ${minutes} min idle`;
        }
        if (this.rule.trigger === 'onLargeDelete') {
            const threshold = this.rule.deletionThreshold || 100;
            return `${this.getTriggerLabel()} • ${threshold}+ lines`;
        }
        if (this.rule.trigger === 'onFileSizeExceeded') {
            const threshold = this.rule.lineSizeThreshold || 300;
            return `${this.getTriggerLabel()} • ${threshold}+ lines`;
        }
        const pattern = this.rule.filePattern || 'All files';
        return `${this.getTriggerLabel()} • ${pattern}`;
    }

    private getTriggerLabel(): string {
        switch (this.rule.trigger) {
            case 'onSave': return '💾 On Save';
            case 'onEdit': return '✏️ On Edit';
            case 'onOpen': return '📂 On Open';
            case 'onFocus': return '🎯 On Focus';
            case 'onWorkspaceOpen': return '🚀 Workspace Open';
            case 'onIdle': return '💤 Idle';
            case 'onTimer': return '⏰ Timer';
            case 'onCreate': return '➕ On Create';
            case 'onDelete': return '🗑️ On Delete';
            case 'onLargeDelete': return '✂️ Large Delete';
            case 'onFileSizeExceeded': return '📏 File Size';
            default: return this.rule.trigger;
        }
    }

    private getIcon(): vscode.ThemeIcon {
        switch (this.rule.trigger) {
            case 'onSave':
                return new vscode.ThemeIcon('save', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.green' : 'disabledForeground'));
            case 'onEdit':
                return new vscode.ThemeIcon('edit', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.blue' : 'disabledForeground'));
            case 'onOpen':
                return new vscode.ThemeIcon('folder-opened', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.yellow' : 'disabledForeground'));
            case 'onFocus':
                return new vscode.ThemeIcon('target', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.purple' : 'disabledForeground'));
            case 'onWorkspaceOpen':
                return new vscode.ThemeIcon('rocket', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.blue' : 'disabledForeground'));
            case 'onIdle':
                return new vscode.ThemeIcon('debug-pause', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.purple' : 'disabledForeground'));
            case 'onTimer':
                return new vscode.ThemeIcon('watch', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.orange' : 'disabledForeground'));
            case 'onCreate':
                return new vscode.ThemeIcon('add', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.green' : 'disabledForeground'));
            case 'onDelete':
                return new vscode.ThemeIcon('trash', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.red' : 'disabledForeground'));
            case 'onLargeDelete':
                return new vscode.ThemeIcon('scissors', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.yellow' : 'disabledForeground'));
            case 'onFileSizeExceeded':
                return new vscode.ThemeIcon('dashboard', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.orange' : 'disabledForeground'));
            default:
                return new vscode.ThemeIcon('bell');
        }
    }
}

export class TriggerTreeDataProvider implements vscode.TreeDataProvider<TriggerTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TriggerTreeItem | undefined | null | void> = new vscode.EventEmitter<TriggerTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TriggerTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {
        console.log('[code-mantra] TriggerTreeDataProvider constructor called');
        // Refresh TreeView when configuration changes
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('codeMantra.rules') ||
                event.affectsConfiguration('codeMantra.triggers')) {
                console.log('[code-mantra] Configuration changed, refreshing TreeView');
                this.refresh();
            }
        });
        console.log('[code-mantra] TriggerTreeDataProvider initialized');
    }

    refresh(): void {
        console.log('[code-mantra] TreeView refresh() called - firing onDidChangeTreeData event');
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TriggerTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TriggerTreeItem): Promise<TriggerTreeItem[]> {
        if (element) {
            return [];
        }

        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        console.log('[code-mantra] TreeView getChildren called');
        console.log('[code-mantra] Found rules:', rules.length);
        console.log('[code-mantra] Rules detail:', JSON.stringify(rules, null, 2));

        // 各ルールのtriggerとenabledをログ出力
        rules.forEach((rule, index) => {
            console.log(`[code-mantra] Rule ${index}: trigger=${rule.trigger}, enabled=${rule.enabled}`);
        });

        if (rules.length === 0) {
            console.log('[code-mantra] No rules found, returning empty array');
            return [];
        }

        // Show all triggers regardless of enabled state (checkbox controls visibility of state)
        const items = rules.map((rule, index) => {
            console.log(`[code-mantra] Creating TreeItem for rule ${index}:`, rule.message);
            return new TriggerTreeItem(rule, index, vscode.TreeItemCollapsibleState.None);
        });

        console.log('[code-mantra] Returning', items.length, 'tree items');
        return items;
    }

    async addTrigger(trigger: TriggerRule): Promise<void> {
        console.log('[code-mantra] addTrigger called with:', JSON.stringify(trigger, null, 2));
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        console.log('[code-mantra] Current rules before add:', rules.length);
        rules.push(trigger);
        console.log('[code-mantra] Rules after push:', rules.length);

        await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
        console.log('[code-mantra] Configuration updated');

        this.refresh();
        console.log('[code-mantra] TreeView refreshed');

        vscode.window.showInformationMessage(`Added trigger "${trigger.message}"`);
    }

    async updateTrigger(index: number, trigger: TriggerRule): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= 0 && index < rules.length) {
            rules[index] = trigger;
            await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
            this.refresh();
            vscode.window.showInformationMessage(`Updated trigger "${trigger.message}"`);
        }
    }

    async deleteTrigger(index: number): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= 0 && index < rules.length) {
            const deletedRule = rules[index];
            rules.splice(index, 1);
            await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
            this.refresh();
            vscode.window.showInformationMessage(`Deleted trigger "${deletedRule.message}"`);
        }
    }

    async toggleTrigger(index: number): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= 0 && index < rules.length) {
            rules[index].enabled = !(rules[index].enabled ?? true);
            await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
            this.refresh();

            const status = rules[index].enabled ? 'enabled' : 'disabled';
            vscode.window.showInformationMessage(`Trigger "${rules[index].message}" ${status}`);
        }
    }

    async moveUp(index: number): Promise<void> {
        if (index <= 0) {
            return;
        }

        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        [rules[index - 1], rules[index]] = [rules[index], rules[index - 1]];

        await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
        this.refresh();
    }

    async moveDown(index: number): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= rules.length - 1) {
            return;
        }

        [rules[index], rules[index + 1]] = [rules[index + 1], rules[index]];

        await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
        this.refresh();
    }
}
