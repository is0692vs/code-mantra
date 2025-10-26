import * as vscode from 'vscode';

export interface TimeBasedNotification {
    duration: number; // duration in minutes
    message: string;
    type: string;
    enabled: boolean;
    id?: string; // Optional unique identifier for timer instances
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
     * Start a timer for the provided notification
     * @param notification notification configuration
     * @param callback callback to invoke when the timer fires
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

        // Use id if provided, otherwise fall back to type
        const timerId = notification.id || notification.type;

        // 既存のタイマーがあれば停止
        this.stopTimer(timerId);

        const durationMs = notification.duration * 60 * 1000;
        const startTime = Date.now();

        console.log(`[code-mantra] Starting timer: ${timerId} (${notification.duration} minutes)`);

        const timeoutId = setTimeout(() => {
            if (!this.disposed) {
                try {
                    console.log(`[code-mantra] Timer fired: ${timerId}`);
                    callback();

                    // タイマーを再設定（繰り返し動作）
                    if (this.timers.has(timerId)) {
                        this.startTimer(notification, callback);
                    }
                } catch (error) {
                    console.error(`[code-mantra] Error in timer callback for ${timerId}:`, error);
                }
            }
        }, durationMs);

        this.timers.set(timerId, {
            timeout: timeoutId,
            startTime,
            notification
        });
    }

    /**
     * Stop a specific timer
     * @param type timer type
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
     * Clear all timers
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
     * Reset timers (restart from a new start time)
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
     * Get the number of active timers
     */
    public getActiveTimerCount(): number {
        return this.timers.size;
    }

    /**
     * Check whether a specific timer is active
     */
    public isTimerActive(type: string): boolean {
        return this.timers.has(type);
    }

    /**
     * Clean up resources and dispose
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
