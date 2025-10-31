import * as vscode from 'vscode';

export class IdleManager {
    private lastActivityTime: number = Date.now();
    private checkInterval: NodeJS.Timeout | undefined;
    private notificationShown: boolean = false;

    constructor(
        private readonly showNotification: (message: string) => void,
        private readonly getRules: () => any[]
    ) { }

    /**
     * Start idle detection
     */
    start(): void {
        this.lastActivityTime = Date.now();
        this.notificationShown = false;

        // Check every minute
        this.checkInterval = setInterval(() => {
            this.checkIdleState();
        }, 60000); // 60 seconds

        console.log('[code-mantra] IdleManager started');
    }

    /**
     * Stop idle detection
     */
    stop(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = undefined;
        }
        console.log('[code-mantra] IdleManager stopped');
    }

    /**
     * Update last activity time (call this on any user activity)
     */
    updateActivity(): void {
        this.lastActivityTime = Date.now();
        this.notificationShown = false;
    }

    /**
     * Check if user is idle and show notification if needed
     */
    private checkIdleState(): void {
        const now = Date.now();
        const idleTimeMinutes = (now - this.lastActivityTime) / 60000;

        const idleRules = this.getRules().filter(
            rule => rule.trigger === 'onIdle' && rule.enabled !== false
        );

        if (idleRules.length === 0) {
            return;
        }

        // Check each idle rule
        for (const rule of idleRules) {
            const requiredIdleMinutes = rule.idleDuration || 15;

            // If idle time exceeds threshold and notification hasn't been shown yet
            if (idleTimeMinutes >= requiredIdleMinutes && !this.notificationShown) {
                console.log(`[code-mantra] User idle for ${idleTimeMinutes.toFixed(1)} minutes (threshold: ${requiredIdleMinutes})`);
                this.showNotification(rule.message);
                this.notificationShown = true;
                break; // Only show one notification
            }
        }
    }
}
