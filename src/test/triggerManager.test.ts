import * as assert from 'assert';
import * as vscode from 'vscode';
import { TriggerManager } from '../triggerManager';

suite('TriggerManager Test Suite', () => {
  let triggerManager: TriggerManager;
  let triggerCallCount = 0;
  let lastTriggeredDocument: vscode.TextDocument | undefined;

  const mockOnTrigger = (document: vscode.TextDocument) => {
    triggerCallCount++;
    lastTriggeredDocument = document;
  };

  setup(() => {
    triggerCallCount = 0;
    lastTriggeredDocument = undefined;
  });

  teardown(() => {
    if (triggerManager) {
      triggerManager.deactivate();
    }
  });

  test('TriggerManager should be created', () => {
    const context = {
      subscriptions: []
    } as any;

    triggerManager = new TriggerManager(context, mockOnTrigger);
    assert.ok(triggerManager);
  });

  test('TriggerManager should activate and deactivate', () => {
    const context = {
      subscriptions: []
    } as any;

    triggerManager = new TriggerManager(context, mockOnTrigger);
    
    // Should not throw
    triggerManager.activate();
    triggerManager.deactivate();
    
    assert.ok(true);
  });

  test('TriggerManager should handle configuration', async () => {
    const context = {
      subscriptions: []
    } as any;

    // Get current config
    const config = vscode.workspace.getConfiguration('codeMantra');
    const triggersConfig = config.get('triggers');
    
    assert.ok(triggersConfig);
    assert.ok(typeof triggersConfig === 'object');
  });

  test('Should support multiple trigger types', () => {
    const context = {
      subscriptions: []
    } as any;

    triggerManager = new TriggerManager(context, mockOnTrigger);
    triggerManager.activate();
    
    // TriggerManager should register listeners based on config
    // This is a basic smoke test
    assert.ok(true);
  });
});
