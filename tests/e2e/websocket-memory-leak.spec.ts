import { test, expect } from '@playwright/test';

test.describe('WebSocket Memory Leak Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Mock WebSocket server
    await page.evaluateOnNewDocument(() => {
      // Track intervals and timeouts for memory leak detection
      (window as unknown as { activeIntervals: Set<number> }).activeIntervals = new Set<number>();
      (window as unknown as { activeTimeouts: Set<number> }).activeTimeouts = new Set<number>();
      
      const originalSetInterval = window.setInterval;
      const originalClearInterval = window.clearInterval;
      const originalSetTimeout = window.setTimeout;
      const originalClearTimeout = window.clearTimeout;
      
      window.setInterval = (...args) => {
        const id = originalSetInterval.apply(window, args);
        (window as any).activeIntervals.add(id);
        return id;
      };
      
      window.clearInterval = (id) => {
        (window as any).activeIntervals.delete(id);
        return originalClearInterval.call(window, id);
      };
      
      window.setTimeout = (...args) => {
        const id = originalSetTimeout.apply(window, args);
        (window as any).activeTimeouts.add(id);
        return id;
      };
      
      window.clearTimeout = (id) => {
        (window as any).activeTimeouts.delete(id);
        return originalClearTimeout.call(window, id);
      };

      // Mock socket.io client
      (window as any).io = () => ({
        connected: false,
        connect: () => {},
        disconnect: () => {},
        on: () => {},
        emit: () => {},
        removeAllListeners: () => {},
      });
    });

    await page.goto('/');
  });

  test('should clean up intervals when WebSocket disconnects', async ({ page }) => {
    // Get initial count of active intervals
    const initialIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    
    // Navigate to a page that uses WebSocket
    await page.click('a[href="/memories"]');
    await page.waitForTimeout(1000);
    
    // Check that intervals were created
    const afterConnectionIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    expect(afterConnectionIntervals).toBeGreaterThan(initialIntervals);
    
    // Simulate WebSocket disconnect
    await page.evaluate(() => {
      // Trigger disconnect event on WebSocket service
      const event = new CustomEvent('websocket:disconnect');
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(500);
    
    // Check that intervals were cleaned up
    const afterDisconnectIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    expect(afterDisconnectIntervals).toBeLessThanOrEqual(initialIntervals);
  });

  test('should clean up connection check intervals', async ({ page }) => {
    // Track intervals before WebSocket operations
    const initialIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    
    // Simulate multiple connection attempts
    await page.evaluate(async () => {
      // Access WebSocket service through global if available
      if ((window as any).websocketService) {
        // Simulate concurrent connection attempts
        (window as any).websocketService.connect();
        (window as any).websocketService.connect();
        (window as any).websocketService.connect();
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Disconnect
    await page.evaluate(() => {
      if ((window as any).websocketService) {
        (window as any).websocketService.disconnect();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check that all intervals were cleaned up
    const finalIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    expect(finalIntervals).toBeLessThanOrEqual(initialIntervals);
  });

  test('should not create memory leaks when navigating between pages', async ({ page }) => {
    const initialIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    const initialTimeouts = await page.evaluate(() => (window as any).activeTimeouts.size);
    
    // Navigate through multiple pages
    await page.click('a[href="/memories"]');
    await page.waitForTimeout(500);
    
    await page.click('a[href="/search"]');
    await page.waitForTimeout(500);
    
    await page.click('a[href="/settings"]');
    await page.waitForTimeout(500);
    
    await page.click('a[href="/"]');
    await page.waitForTimeout(500);
    
    // Check that intervals and timeouts are properly managed
    const finalIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    const finalTimeouts = await page.evaluate(() => (window as any).activeTimeouts.size);
    
    // Should not have excessive accumulation of intervals/timeouts
    expect(finalIntervals - initialIntervals).toBeLessThan(5);
    expect(finalTimeouts - initialTimeouts).toBeLessThan(10);
  });

  test('should clean up event listeners on component unmount', async ({ page }) => {
    // Navigate to memories page
    await page.click('a[href="/memories"]');
    await page.waitForTimeout(500);
    
    // Check that event listeners are registered
    const listenersCount = await page.evaluate(() => {
      // Check if WebSocket service has listeners
      return (window as any).websocketService?.listeners?.size || 0;
    });
    
    // Navigate away
    await page.click('a[href="/settings"]');
    await page.waitForTimeout(500);
    
    // Check that listeners were cleaned up
    const remainingListeners = await page.evaluate(() => {
      return (window as any).websocketService?.listeners?.size || 0;
    });
    
    // There should be fewer or equal listeners after navigation
    expect(remainingListeners).toBeLessThanOrEqual(listenersCount);
  });

  test('should handle rapid connect/disconnect cycles without leaks', async ({ page }) => {
    const initialIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    
    // Simulate rapid connect/disconnect cycles
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        if ((window as any).websocketService) {
          (window as any).websocketService.connect();
          setTimeout(() => {
            (window as any).websocketService.disconnect();
          }, 100);
        }
      });
      await page.waitForTimeout(200);
    }
    
    await page.waitForTimeout(1000);
    
    // Check that intervals were properly cleaned up
    const finalIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    expect(finalIntervals - initialIntervals).toBeLessThan(3);
  });

  test('should timeout connection check intervals', async ({ page }) => {
    const initialIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    
    // Simulate a connection attempt that never resolves
    await page.evaluate(() => {
      if ((window as any).websocketService) {
        // Mock a connection that never completes
        (window as any).websocketService.isConnecting = true;
        (window as any).websocketService.connect().catch(() => {});
      }
    });
    
    // Wait for timeout to trigger (should be 10 seconds based on our implementation)
    await page.waitForTimeout(11000);
    
    // Check that intervals were cleaned up by timeout
    const finalIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    expect(finalIntervals).toBeLessThanOrEqual(initialIntervals + 1);
  });

  test('should clean up latency monitoring on disconnect', async ({ page }) => {
    // Navigate to memories to start WebSocket connection
    await page.click('a[href="/memories"]');
    await page.waitForTimeout(1000);
    
    const initialIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    
    // Simulate successful connection that starts latency monitoring
    await page.evaluate(() => {
      if ((window as any).websocketService) {
        (window as any).websocketService.startLatencyMonitoring?.();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Should have more intervals (latency monitoring)
    const withLatencyIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    expect(withLatencyIntervals).toBeGreaterThan(initialIntervals);
    
    // Disconnect and check cleanup
    await page.evaluate(() => {
      if ((window as any).websocketService) {
        (window as any).websocketService.disconnect();
      }
    });
    
    await page.waitForTimeout(500);
    
    const afterDisconnectIntervals = await page.evaluate(() => (window as any).activeIntervals.size);
    expect(afterDisconnectIntervals).toBeLessThanOrEqual(initialIntervals);
  });

  test('should not accumulate listeners on repeated subscriptions', async ({ page }) => {
    // Navigate to memories page multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('a[href="/memories"]');
      await page.waitForTimeout(300);
      await page.click('a[href="/settings"]');
      await page.waitForTimeout(300);
    }
    
    // Final navigation to memories
    await page.click('a[href="/memories"]');
    await page.waitForTimeout(500);
    
    // Check that listeners haven't accumulated excessively
    const totalListeners = await page.evaluate(() => {
      let total = 0;
      if ((window as any).websocketService?.listeners) {
        for (const [, callbacks] of (window as any).websocketService.listeners) {
          total += callbacks.size;
        }
      }
      return total;
    });
    
    // Should not have excessive listeners (reasonable threshold)
    expect(totalListeners).toBeLessThan(20);
  });
});