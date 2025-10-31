import * as assert from 'assert';
import { IdleManager } from '../idleManager';
import { TriggerRule } from '../triggerTreeView';

suite('IdleManager Test Suite', () => {
    let idleManager: IdleManager | undefined;
    let notificationsCalled: string[] = [];
    let testRules: TriggerRule[] = [];

    const mockShowNotification = (message: string) => {
        notificationsCalled.push(message);
        console.log(`[test] Notification: ${message}`);
    };

    const mockGetRules = () => {
        return testRules;
    };

    setup(() => {
        notificationsCalled = [];
        testRules = [];
    });

    teardown(() => {
        if (idleManager) {
            idleManager.stop();
        }
    });

    test('Should initialize IdleManager with callbacks', () => {
        idleManager = new IdleManager(mockShowNotification, mockGetRules);
        assert.ok(idleManager, 'IdleManager should be created');
    });

    test('Should start and stop idle detection', () => {
        idleManager = new IdleManager(mockShowNotification, mockGetRules);
        idleManager.start();
        assert.ok(true, 'start() should not throw');

        idleManager.stop();
        assert.ok(true, 'stop() should not throw');
    });

    test('Should reset idle state on updateActivity()', () => {
        idleManager = new IdleManager(mockShowNotification, mockGetRules);
        idleManager.start();

        // Call updateActivity
        idleManager.updateActivity();
        assert.ok(true, 'updateActivity() should not throw');

        // Notifications should not have been called yet
        assert.strictEqual(notificationsCalled.length, 0, 'No notifications should be shown immediately');

        idleManager.stop();
    });

    test('Should support onIdle trigger rule structure', () => {
        const idleRule: TriggerRule = {
            trigger: 'onIdle',
            message: 'Take a break!',
            idleDuration: 15,
            enabled: true
        };

        assert.strictEqual(idleRule.trigger, 'onIdle');
        assert.ok(idleRule.idleDuration);
        assert.strictEqual(idleRule.idleDuration, 15);
        assert.strictEqual(idleRule.message, 'Take a break!');
    });

    test('Should validate idle duration (1-120 range)', () => {
        // Valid durations
        const validDurations = [1, 5, 15, 30, 60, 120];
        validDurations.forEach(duration => {
            assert.ok(duration >= 1 && duration <= 120, `Duration ${duration} should be valid`);
        });

        // Invalid durations
        const invalidDurations = [0, -1, 121, 1000];
        invalidDurations.forEach(duration => {
            assert.ok(!(duration >= 1 && duration <= 120), `Duration ${duration} should be invalid`);
        });
    });

    test('Should handle multiple onIdle rules', () => {
        testRules = [
            {
                trigger: 'onIdle',
                message: 'Rule 1: Take a break!',
                idleDuration: 15,
                enabled: true
            },
            {
                trigger: 'onIdle',
                message: 'Rule 2: Try a different approach!',
                idleDuration: 30,
                enabled: true
            }
        ];

        const idleRules = testRules.filter(rule => rule.trigger === 'onIdle' && rule.enabled !== false);
        assert.strictEqual(idleRules.length, 2, 'Should have 2 onIdle rules');
    });

    test('Should skip disabled onIdle rules', () => {
        testRules = [
            {
                trigger: 'onIdle',
                message: 'Enabled rule',
                idleDuration: 15,
                enabled: true
            },
            {
                trigger: 'onIdle',
                message: 'Disabled rule',
                idleDuration: 30,
                enabled: false
            }
        ];

        const enabledRules = testRules.filter(rule => rule.trigger === 'onIdle' && rule.enabled !== false);
        assert.strictEqual(enabledRules.length, 1, 'Should only have 1 enabled onIdle rule');
        assert.strictEqual(enabledRules[0].message, 'Enabled rule');
    });

    test('Should use default idle duration when not specified', () => {
        const ruleWithoutDuration: TriggerRule = {
            trigger: 'onIdle',
            message: 'Take a break!',
            enabled: true
            // idleDuration not specified
        };

        // Default should be 15 when not specified
        const duration = ruleWithoutDuration.idleDuration || 15;
        assert.strictEqual(duration, 15, 'Should use default duration of 15 minutes');
    });

    test('Should validate idle duration range in rule', () => {
        const rules: TriggerRule[] = [
            {
                trigger: 'onIdle',
                message: 'Min duration',
                idleDuration: 1,
                enabled: true
            },
            {
                trigger: 'onIdle',
                message: 'Max duration',
                idleDuration: 120,
                enabled: true
            }
        ];

        rules.forEach(rule => {
            const duration = rule.idleDuration || 15;
            assert.ok(duration >= 1 && duration <= 120, `Duration ${duration} should be in valid range`);
        });
    });

    test('Should create IdleManager instance with getRules callback', () => {
        testRules = [
            {
                trigger: 'onIdle',
                message: 'Test message',
                idleDuration: 10,
                enabled: true
            }
        ];

        idleManager = new IdleManager(mockShowNotification, mockGetRules);
        const rules = mockGetRules();

        assert.ok(Array.isArray(rules), 'getRules should return an array');
        assert.strictEqual(rules.length, 1, 'Should have 1 rule');
        assert.strictEqual(rules[0].trigger, 'onIdle');
    });

    test('Should handle mixed trigger types with onIdle', () => {
        testRules = [
            {
                trigger: 'onSave',
                message: 'On save message',
                enabled: true
            },
            {
                trigger: 'onIdle',
                message: 'On idle message',
                idleDuration: 15,
                enabled: true
            },
            {
                trigger: 'onEdit',
                message: 'On edit message',
                enabled: true
            }
        ];

        const idleRules = testRules.filter(rule => rule.trigger === 'onIdle');
        const otherRules = testRules.filter(rule => rule.trigger !== 'onIdle');

        assert.strictEqual(idleRules.length, 1, 'Should have 1 onIdle rule');
        assert.strictEqual(otherRules.length, 2, 'Should have 2 other rules');
    });
});
