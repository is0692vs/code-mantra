import * as vscode from 'vscode';

export interface TimeBasedNotification {
    duration: number; // 分単位
    message: string;
    type: string;
    enabled: boolean;
}

interface TimerState {
    timeout: NodeJS.Timeout;
    startTime: number;
    notification: TimeBasedNotification;
}

export class TimerManager {
    private timers: Map<string, TimerState> = new Map();
    private disposed: boolean = false;

    constructor() {
        console.log('[code-mantra] TimerManager initialized');
    }

    /**
     * タイマーを開始する
     * @param notification 通知設定
     * @param callback 通知を表示するコールバック
     */
    public startTimer(notification: TimeBasedNotification, callback: () => void): void {
        if (this.disposed) {
            console.warn('[code-mantra] TimerManager is disposed, cannot start timer');
            return;
        }

        if (!notification.enabled) {
            console.log(`[code-mantra] Timer ${notification.type} is disabled, skipping`);
            return;
        }

        // 既存のタイマーがあれば停止
        this.stopTimer(notification.type);

        const durationMs = notification.duration * 60 * 1000;
        const startTime = Date.now();

        console.log(`[code-mantra] Starting timer: ${notification.type} (${notification.duration} minutes)`);

        const timeoutId = setTimeout(() => {
            if (!this.disposed) {
                try {
                    console.log(`[code-mantra] Timer fired: ${notification.type}`);
                    callback();

                    // タイマーを再設定（繰り返し動作）
                    if (this.timers.has(notification.type)) {
                        this.startTimer(notification, callback);
                    }
                } catch (error) {
                    console.error(`[code-mantra] Error in timer callback for ${notification.type}:`, error);
                }
            }
        }, durationMs);

        this.timers.set(notification.type, {
            timeout: timeoutId,
            startTime,
            notification
        });
    }

    /**
     * 特定のタイマーを停止する
     * @param type 通知タイプ
     */
    public stopTimer(type: string): void {
        const timerState = this.timers.get(type);
        if (timerState) {
            clearTimeout(timerState.timeout);
            this.timers.delete(type);
            console.log(`[code-mantra] Timer stopped: ${type}`);
        }
    }

    /**
     * すべてのタイマーをクリアする
     */
    public clearAllTimers(): void {
        console.log('[code-mantra] Clearing all timers');
        for (const [type, timerState] of this.timers.entries()) {
            clearTimeout(timerState.timeout);
            console.log(`[code-mantra] Timer cleared: ${type}`);
        }
        this.timers.clear();
    }

    /**
     * タイマーをリセットする（新しい開始時刻から再スタート）
     */
    public resetTimers(): void {
        console.log('[code-mantra] Resetting all timers');

        // 現在のタイマー状態を保存
        const currentTimers = Array.from(this.timers.values()).map(state => ({
            notification: state.notification,
            callback: null // コールバックは再設定時に提供される必要がある
        }));

        // すべてのタイマーをクリア
        this.clearAllTimers();

        // タイマーを再起動するためには、extension.ts 側で再設定する必要がある
        // このメソッドは単にクリアのみを行い、再起動は呼び出し側の責任とする
        console.log('[code-mantra] Timers reset. Call startTimer again to restart.');
    }

    /**
     * アクティブなタイマーの数を取得
     */
    public getActiveTimerCount(): number {
        return this.timers.size;
    }

    /**
     * 特定のタイマーがアクティブかどうかを確認
     */
    public isTimerActive(type: string): boolean {
        return this.timers.has(type);
    }

    /**
     * リソースをクリーンアップして破棄
     */
    public dispose(): void {
        if (this.disposed) {
            return;
        }

        console.log('[code-mantra] Disposing TimerManager');
        this.clearAllTimers();
        this.disposed = true;
    }
}
