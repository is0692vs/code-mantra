import * as vscode from 'vscode';

export interface TriggerRule {
    trigger: 'onSave' | 'onEdit' | 'onOpen' | 'onFocus' | 'onTimer';
    message: string;
    filePattern?: string;
    enabled?: boolean;
    duration?: number; // duration in minutes (only for onTimer)
    timerType?: 'workBreak' | 'pomodoro' | 'custom'; // timer type (only for onTimer)
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
        if (this.rule.trigger === 'onTimer') {
            const duration = this.rule.duration || 25;
            const type = this.rule.timerType || 'custom';
            return `${status}\nTrigger: Time-based (every ${duration} min)\nType: ${type}`;
        }
        const pattern = this.rule.filePattern || '**/*.*';
        return `${status}\nTrigger: ${this.rule.trigger}\nPattern: ${pattern}`;
    }

    private getDescription(): string {
        if (this.rule.trigger === 'onTimer') {
            const duration = this.rule.duration || 25;
            return `${this.getTriggerLabel()} • Every ${duration} min`;
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
            case 'onTimer': return '⏰ Timer';
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
            case 'onTimer':
                return new vscode.ThemeIcon('watch', new vscode.ThemeColor(this.rule.enabled !== false ? 'charts.orange' : 'disabledForeground'));
            default:
                return new vscode.ThemeIcon('bell');
        }
    }
}

export class TriggerTreeDataProvider implements vscode.TreeDataProvider<TriggerTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TriggerTreeItem | undefined | null | void> = new vscode.EventEmitter<TriggerTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TriggerTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {
        // 設定変更時にTreeViewを更新
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('codeMantra.rules') ||
                event.affectsConfiguration('codeMantra.triggers')) {
                this.refresh();
            }
        });
    }

    refresh(): void {
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

        if (rules.length === 0) {
            return [];
        }

        return rules.map((rule, index) =>
            new TriggerTreeItem(rule, index, vscode.TreeItemCollapsibleState.None)
        );
    }

    async addTrigger(trigger: TriggerRule): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        rules.push(trigger);

        await config.update('rules', rules, vscode.ConfigurationTarget.Global);
        this.refresh();

        vscode.window.showInformationMessage(`Added trigger "${trigger.message}"`);
    }

    async updateTrigger(index: number, trigger: TriggerRule): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= 0 && index < rules.length) {
            rules[index] = trigger;
            await config.update('rules', rules, vscode.ConfigurationTarget.Global);
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
            await config.update('rules', rules, vscode.ConfigurationTarget.Global);
            this.refresh();
            vscode.window.showInformationMessage(`Deleted trigger "${deletedRule.message}"`);
        }
    }

    async toggleTrigger(index: number): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= 0 && index < rules.length) {
            rules[index].enabled = !(rules[index].enabled ?? true);
            await config.update('rules', rules, vscode.ConfigurationTarget.Global);
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

        await config.update('rules', rules, vscode.ConfigurationTarget.Global);
        this.refresh();
    }

    async moveDown(index: number): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= rules.length - 1) {
            return;
        }

        [rules[index], rules[index + 1]] = [rules[index + 1], rules[index]];

        await config.update('rules', rules, vscode.ConfigurationTarget.Global);
        this.refresh();
    }
}
