/**
 * Manages notification suppression to prevent duplicate or unwanted notifications
 * from multiple triggers firing simultaneously.
 */
export class SuppressionManager {
    // Track recent notifications per file per trigger type
    private recentNotifications = new Map<string, Map<string, number>>();

    // Suppression window: 500ms
    private readonly SUPPRESSION_WINDOW_MS = 500;

    // Track files currently being saved (per-file tracking)
    private savingFiles = new Set<string>();

    // Track previous line counts for detecting threshold crossing
    private previousLineCounts = new Map<string, number>();

    // Suppression rules: which triggers should suppress which other triggers
    private readonly suppressionRules: Record<string, string[]> = {
        'onSave': ['onEdit'], // onSave suppresses onEdit
        'onCreate': ['onSave'], // onCreate suppresses onSave for new files
    };

    /**
     * Check if a notification should be suppressed
     * @param filePath The file path for the notification
     * @param triggerType The type of trigger (onSave, onEdit, etc.)
     * @returns true if notification should be suppressed
     */
    shouldSuppress(filePath: string, triggerType: string): boolean {
        const now = Date.now();

        // Check if file is currently being saved
        if (this.savingFiles.has(filePath)) {
            console.log(`[SuppressionManager] Suppressing ${triggerType} for ${filePath} (file is being saved)`);
            return true;
        }

        // Get recent notifications for this file
        const fileNotifications = this.recentNotifications.get(filePath);
        if (!fileNotifications) {
            return false;
        }

        // Check if this trigger type was recently notified
        const lastNotificationTime = fileNotifications.get(triggerType);
        if (lastNotificationTime && (now - lastNotificationTime) < this.SUPPRESSION_WINDOW_MS) {
            console.log(`[SuppressionManager] Suppressing ${triggerType} for ${filePath} (same trigger within ${this.SUPPRESSION_WINDOW_MS}ms)`);
            return true;
        }

        // Check if any suppressing trigger was recently fired
        for (const [suppressingTrigger, suppressedTriggers] of Object.entries(this.suppressionRules)) {
            if (suppressedTriggers.includes(triggerType)) {
                const suppressingTime = fileNotifications.get(suppressingTrigger);
                if (suppressingTime && (now - suppressingTime) < this.SUPPRESSION_WINDOW_MS) {
                    console.log(`[SuppressionManager] Suppressing ${triggerType} for ${filePath} (suppressed by ${suppressingTrigger})`);
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Record that a notification was shown
     * @param filePath The file path for the notification
     * @param triggerType The type of trigger
     */
    recordNotification(filePath: string, triggerType: string): void {
        let fileNotifications = this.recentNotifications.get(filePath);
        if (!fileNotifications) {
            fileNotifications = new Map<string, number>();
            this.recentNotifications.set(filePath, fileNotifications);
        }

        fileNotifications.set(triggerType, Date.now());
        console.log(`[SuppressionManager] Recorded ${triggerType} notification for ${filePath}`);

        // Clean up old entries after a delay
        setTimeout(() => {
            this.cleanupOldNotifications(filePath);
        }, this.SUPPRESSION_WINDOW_MS * 2);
    }

    /**
     * Mark a file as being saved
     * @param filePath The file path being saved
     */
    markFileSaving(filePath: string): void {
        this.savingFiles.add(filePath);
        console.log(`[SuppressionManager] Marked ${filePath} as being saved`);

        // Automatically unmark after 200ms
        setTimeout(() => {
            this.savingFiles.delete(filePath);
            console.log(`[SuppressionManager] Unmarked ${filePath} as being saved`);
        }, 200);
    }

    /**
     * Check if a file is currently being saved
     * @param filePath The file path to check
     */
    isFileSaving(filePath: string): boolean {
        return this.savingFiles.has(filePath);
    }

    /**
     * Update the line count for a file
     * @param filePath The file path
     * @param lineCount The current line count
     */
    updateLineCount(filePath: string, lineCount: number): void {
        this.previousLineCounts.set(filePath, lineCount);
    }

    /**
     * Get the previous line count for a file
     * @param filePath The file path
     * @returns The previous line count, or undefined if not tracked
     */
    getPreviousLineCount(filePath: string): number | undefined {
        return this.previousLineCounts.get(filePath);
    }

    /**
     * Check if file size crossed a threshold (previous < threshold, current >= threshold)
     * @param filePath The file path
     * @param currentLineCount The current line count
     * @param threshold The threshold to check
     * @returns true if threshold was crossed
     */
    didCrossThreshold(filePath: string, currentLineCount: number, threshold: number): boolean {
        const previousLineCount = this.previousLineCounts.get(filePath);

        // If no previous count, assume the current count (no crossing)
        if (previousLineCount === undefined) {
            return false;
        }

        // Check if we crossed from below to above threshold
        const crossed = previousLineCount < threshold && currentLineCount >= threshold;

        if (crossed) {
            console.log(`[SuppressionManager] Threshold ${threshold} crossed: ${previousLineCount} -> ${currentLineCount} in ${filePath}`);
        }

        return crossed;
    }

    /**
     * Clean up tracking data for a closed file
     * @param filePath The file path that was closed
     */
    cleanupFile(filePath: string): void {
        this.recentNotifications.delete(filePath);
        this.previousLineCounts.delete(filePath);
        this.savingFiles.delete(filePath);
        console.log(`[SuppressionManager] Cleaned up tracking for ${filePath}`);
    }

    /**
     * Clean up old notifications for a file
     */
    private cleanupOldNotifications(filePath: string): void {
        const fileNotifications = this.recentNotifications.get(filePath);
        if (!fileNotifications) {
            return;
        }

        const now = Date.now();
        const toDelete: string[] = [];

        fileNotifications.forEach((time, trigger) => {
            if (now - time > this.SUPPRESSION_WINDOW_MS * 2) {
                toDelete.push(trigger);
            }
        });

        toDelete.forEach(trigger => fileNotifications.delete(trigger));

        if (fileNotifications.size === 0) {
            this.recentNotifications.delete(filePath);
        }
    }
}
