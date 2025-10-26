import * as assert from 'assert';
import { TimerManager, TimeBasedNotification } from '../timerManager';

suite('TimerManager Test Suite', () => {
	let timerManager: TimerManager;
	let callbackCount: number;
	let lastCallbackType: string;

	setup(() => {
		timerManager = new TimerManager();
		callbackCount = 0;
		lastCallbackType = '';
	});

	teardown(() => {
		timerManager.dispose();
	});

	test('タイマーの開始と停止', (done) => {
		const notification: TimeBasedNotification = {
			duration: 0.01, // 600ms (テスト用に短縮)
			message: 'Test notification',
			type: 'test',
			enabled: true
		};

		timerManager.startTimer(notification, () => {
			callbackCount++;
			lastCallbackType = notification.type;
		});

		assert.strictEqual(timerManager.isTimerActive('test'), true, 'Timer should be active');

		// タイマーが発火するのを待つ
		setTimeout(() => {
			assert.strictEqual(callbackCount, 1, 'Callback should have been called once');
			assert.strictEqual(lastCallbackType, 'test', 'Callback type should match');
			
			// タイマーを停止
			timerManager.stopTimer('test');
			assert.strictEqual(timerManager.isTimerActive('test'), false, 'Timer should be inactive');
			
			done();
		}, 700);
	});

	test('複数のタイマーの管理', (done) => {
		const notification1: TimeBasedNotification = {
			duration: 0.01, // 600ms
			message: 'Test notification 1',
			type: 'test1',
			enabled: true
		};

		const notification2: TimeBasedNotification = {
			duration: 0.02, // 1200ms
			message: 'Test notification 2',
			type: 'test2',
			enabled: true
		};

		let callback1Count = 0;
		let callback2Count = 0;

		timerManager.startTimer(notification1, () => {
			callback1Count++;
		});

		timerManager.startTimer(notification2, () => {
			callback2Count++;
		});

		assert.strictEqual(timerManager.getActiveTimerCount(), 2, 'Should have 2 active timers');
		assert.strictEqual(timerManager.isTimerActive('test1'), true, 'Timer 1 should be active');
		assert.strictEqual(timerManager.isTimerActive('test2'), true, 'Timer 2 should be active');

		// 最初のタイマーが発火するのを待つ
		setTimeout(() => {
			assert.strictEqual(callback1Count >= 1, true, 'Callback 1 should have been called at least once');
			assert.strictEqual(callback2Count, 0, 'Callback 2 should not have been called yet');
		}, 700);

		// 2番目のタイマーが発火するのを待つ
		setTimeout(() => {
			assert.strictEqual(callback2Count >= 1, true, 'Callback 2 should have been called at least once');
			
			// タイマーをクリーンアップして再起動を防ぐ
			timerManager.clearAllTimers();
			done();
		}, 1300);
	});

	test('タイマーのリセット', (done) => {
		const notification: TimeBasedNotification = {
			duration: 0.02, // 1200ms
			message: 'Test notification',
			type: 'test',
			enabled: true
		};

		timerManager.startTimer(notification, () => {
			callbackCount++;
		});

		assert.strictEqual(timerManager.isTimerActive('test'), true, 'Timer should be active');

		// 600ms後にリセット
		setTimeout(() => {
			timerManager.clearAllTimers();
			assert.strictEqual(timerManager.getActiveTimerCount(), 0, 'All timers should be cleared');
			assert.strictEqual(callbackCount, 0, 'Callback should not have been called');
			
			done();
		}, 600);
	});

	test('無効なタイマーは開始されない', () => {
		const notification: TimeBasedNotification = {
			duration: 0.01,
			message: 'Test notification',
			type: 'test',
			enabled: false
		};

		timerManager.startTimer(notification, () => {
			callbackCount++;
		});

		assert.strictEqual(timerManager.isTimerActive('test'), false, 'Disabled timer should not be active');
		assert.strictEqual(timerManager.getActiveTimerCount(), 0, 'Should have no active timers');
	});

	test('同じタイプのタイマーを再起動すると前のタイマーが停止される', (done) => {
		const notification1: TimeBasedNotification = {
			duration: 0.01, // 600ms
			message: 'First timer',
			type: 'test',
			enabled: true
		};

		const notification2: TimeBasedNotification = {
			duration: 0.02, // 1200ms
			message: 'Second timer',
			type: 'test',
			enabled: true
		};

		let firstCallbackCount = 0;
		let secondCallbackCount = 0;

		timerManager.startTimer(notification1, () => {
			firstCallbackCount++;
		});

		// 300ms後に同じタイプのタイマーを再起動
		setTimeout(() => {
			timerManager.startTimer(notification2, () => {
				secondCallbackCount++;
			});

			assert.strictEqual(timerManager.getActiveTimerCount(), 1, 'Should only have 1 active timer');
		}, 300);

		// 最初のタイマーの発火時刻(600ms)を待つ
		setTimeout(() => {
			assert.strictEqual(firstCallbackCount, 0, 'First callback should not have been called');
			assert.strictEqual(secondCallbackCount, 0, 'Second callback should not have been called yet');
		}, 700);

		// 2番目のタイマーの発火時刻(300ms + 1200ms = 1500ms)を待つ
		setTimeout(() => {
			assert.strictEqual(firstCallbackCount, 0, 'First callback should still not be called');
			assert.strictEqual(secondCallbackCount, 1, 'Second callback should have been called');
			
			done();
		}, 1600);
	});
});
