import * as vscode from 'vscode';

export interface TriggerRule {
    trigger: 'onSave' | 'onEdit' | 'onOpen' | 'onFocus';
    message: string;
    filePattern?: string;
    enabled?: boolean;
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

        // チェックボックスの状態を設定
        this.checkboxState = {
            state: rule.enabled !== false ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked,
            tooltip: rule.enabled !== false ? 'トリガーを無効化' : 'トリガーを有効化'
        };
    }

    private getTooltip(): string {
        const status = this.rule.enabled !== false ? '✅ 有効' : '❌ 無効';
        const pattern = this.rule.filePattern || '**/*.*';
        return `${status}\nトリガー: ${this.rule.trigger}\nパターン: ${pattern}`;
    }

    private getDescription(): string {
        const pattern = this.rule.filePattern || '全てのファイル';
        return `${this.getTriggerLabel()} • ${pattern}`;
    }

    private getTriggerLabel(): string {
        switch (this.rule.trigger) {
            case 'onSave': return '💾 保存時';
            case 'onEdit': return '✏️ 編集時';
            case 'onOpen': return '📂 開く時';
            case 'onFocus': return '🎯 フォーカス時';
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

        vscode.window.showInformationMessage(`トリガー「${trigger.message}」を追加しました`);
    }

    async updateTrigger(index: number, trigger: TriggerRule): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= 0 && index < rules.length) {
            rules[index] = trigger;
            await config.update('rules', rules, vscode.ConfigurationTarget.Global);
            this.refresh();
            vscode.window.showInformationMessage(`トリガー「${trigger.message}」を更新しました`);
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
            vscode.window.showInformationMessage(`トリガー「${deletedRule.message}」を削除しました`);
        }
    }

    async toggleTrigger(index: number): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeMantra');
        const rules = config.get<TriggerRule[]>('rules', []);

        if (index >= 0 && index < rules.length) {
            rules[index].enabled = !(rules[index].enabled ?? true);
            await config.update('rules', rules, vscode.ConfigurationTarget.Global);
            this.refresh();

            const status = rules[index].enabled ? '有効化' : '無効化';
            vscode.window.showInformationMessage(`トリガー「${rules[index].message}」を${status}しました`);
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
