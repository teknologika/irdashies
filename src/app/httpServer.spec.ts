import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isPortAvailable, findAvailablePort, WidgetHttpServer, isValidWidgetType, validateWidgetParams, createWidgetErrorResponse, createWidgetHtmlTemplate } from './httpServer';
import { VALID_WIDGET_TYPES, WIDGET_DISPLAY_NAMES, WIDGET_DESCRIPTIONS } from '../types/httpServer';
import * as net from 'net';

describe('httpServer port utilities', () => {
  let testServers: net.Server[] = [];

  beforeEach(() => {
    testServers = [];
  });

  afterEach(async () => {
    // Clean up any test servers
    await Promise.all(
      testServers.map(server => 
        new Promise<void>((resolve) => {
          if (server.listening) {
            server.close(() => resolve());
          } else {
            resolve();
          }
        })
      )
    );
    testServers = [];
  });

  /**
   * Helper function to occupy a port for testing
   */
  async function occupyPort(port: number): Promise<net.Server> {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      
      server.once('error', reject);
      server.once('listening', () => {
        testServers.push(server);
        resolve(server);
      });
      
      server.listen(port, '127.0.0.1');
    });
  }

  describe('isPortAvailable', () => {
    it('should return true for an available port', async () => {
      // Use a high port that's likely to be available
      const port = 58900;
      const result = await isPortAvailable(port);
      
      expect(result).toBe(true);
    });

    it('should return false for an occupied port', async () => {
      const port = 58901;
      
      // Occupy the port
      await occupyPort(port);
      
      // Test that it's detected as unavailable
      const result = await isPortAvailable(port);
      
      expect(result).toBe(false);
    });

    it('should return false for privileged ports (when not running as root)', async () => {
      // Test port 80 (HTTP) which requires root privileges
      const result = await isPortAvailable(80);
      
      // Should be false unless running tests as root (which we shouldn't)
      expect(result).toBe(false);
    });

    it('should handle multiple concurrent checks correctly', async () => {
      const ports = [58902, 58903, 58904];
      
      // Test multiple ports concurrently
      const results = await Promise.all(
        ports.map(port => isPortAvailable(port))
      );
      
      // All should be available
      expect(results).toEqual([true, true, true]);
    });

    it('should quickly return false for occupied ports', async () => {
      const port = 58905;
      await occupyPort(port);
      
      const startTime = Date.now();
      const result = await isPortAvailable(port);
      const duration = Date.now() - startTime;
      
      expect(result).toBe(false);
      // Should return quickly, not wait for timeout
      expect(duration).toBeLessThan(500);
    });
  });

  describe('findAvailablePort', () => {
    it('should return the start port when available', async () => {
      const startPort = 58910;
      
      const result = await findAvailablePort(startPort, 1);
      
      expect(result).toBe(startPort);
    });

    it('should find the next available port when start port is occupied', async () => {
      const startPort = 58920;
      
      // Occupy the first two ports
      await occupyPort(startPort);
      await occupyPort(startPort + 1);
      
      const result = await findAvailablePort(startPort, 5);
      
      // Should find the third port (startPort + 2)
      expect(result).toBe(startPort + 2);
    });

    it('should throw error when all attempted ports are occupied', async () => {
      const startPort = 58930;
      const maxAttempts = 3;
      
      // Occupy all ports in the range
      for (let i = 0; i < maxAttempts; i++) {
        await occupyPort(startPort + i);
      }
      
      await expect(findAvailablePort(startPort, maxAttempts)).rejects.toThrow(
        `No available port found after trying ${maxAttempts} ports starting from ${startPort}`
      );
    });

    it('should use default parameters correctly', async () => {
      // This test assumes default port 58080 is available
      // If not, it will try subsequent ports
      const result = await findAvailablePort();
      
      expect(result).toBeGreaterThanOrEqual(58080);
      expect(result).toBeLessThan(58090); // Within default range
    });

    it('should handle port scan efficiently', async () => {
      const startPort = 58940;
      const maxAttempts = 5;
      
      // Occupy some ports in the middle of the range
      await occupyPort(startPort + 1);
      await occupyPort(startPort + 3);
      
      const startTime = Date.now();
      const result = await findAvailablePort(startPort, maxAttempts);
      const duration = Date.now() - startTime;
      
      // Should find first available port (startPort + 0)
      expect(result).toBe(startPort);
      // Should complete quickly
      expect(duration).toBeLessThan(1000);
    });

    it('should skip over consecutive occupied ports', async () => {
      const startPort = 58950;
      
      // Occupy first 3 ports
      await occupyPort(startPort);
      await occupyPort(startPort + 1);
      await occupyPort(startPort + 2);
      
      const result = await findAvailablePort(startPort, 5);
      
      // Should find the 4th port
      expect(result).toBe(startPort + 3);
    });

    it('should work with different port ranges', async () => {
      // Test with a different starting port
      const startPort = 59000;
      
      const result = await findAvailablePort(startPort, 3);
      
      expect(result).toBeGreaterThanOrEqual(startPort);
      expect(result).toBeLessThan(startPort + 3);
    });

    it('should handle single port attempt', async () => {
      const startPort = 58960;
      
      const result = await findAvailablePort(startPort, 1);
      
      expect(result).toBe(startPort);
    });

    it('should handle error during port checking gracefully', async () => {
      const startPort = 58970;
      
      // Occupy first port, leave second available
      await occupyPort(startPort);
      
      const result = await findAvailablePort(startPort, 5);
      
      // Should skip the occupied port and find the next one
      expect(result).toBe(startPort + 1);
    });
  });

  describe('integration scenarios', () => {
    it('should work in realistic OBS port selection scenario', async () => {
      const defaultPort = 58080;
      
      // Simulate some ports being occupied (maybe by other apps)
      const occupiedPorts = [58080, 58082, 58084];
      for (const port of occupiedPorts) {
        try {
          await occupyPort(port);
        } catch {
          // Port might already be occupied by system, that's fine
        }
      }
      
      // Should find an available port in the range
      const result = await findAvailablePort(defaultPort, 10);
      
      expect(result).toBeGreaterThanOrEqual(defaultPort);
      expect(result).toBeLessThan(defaultPort + 10);
      
      // Verify the found port is actually available
      const isAvailable = await isPortAvailable(result);
      expect(isAvailable).toBe(true);
    });

    it('should handle rapid port checks during server restart', async () => {
      const port = 58980;
      
      // Simulate rapid availability checks - they should all succeed or all fail consistently
      const checks = Array(5).fill(null).map(() => isPortAvailable(port));
      const results = await Promise.all(checks);
      
      // All results should be boolean values
      expect(results.every(result => typeof result === 'boolean')).toBe(true);
      // There should be at least one successful check since port should be available
      expect(results.some(result => result === true)).toBe(true);
    });
  });
});

describe('WidgetHttpServer', () => {
  let server: WidgetHttpServer;
  let testServers: net.Server[] = [];

  beforeEach(() => {
    server = new WidgetHttpServer();
    testServers = [];
  });

  afterEach(async () => {
    // Clean up any running servers
    if (server.isRunning()) {
      await server.stop();
    }
    
    // Clean up any test servers
    await Promise.all(
      testServers.map(testServer => 
        new Promise<void>((resolve) => {
          if (testServer.listening) {
            testServer.close(() => resolve());
          } else {
            resolve();
          }
        })
      )
    );
    testServers = [];
  });

  /**
   * Helper function to occupy a port for testing
   */
  async function occupyPort(port: number): Promise<net.Server> {
    return new Promise((resolve, reject) => {
      const testServer = net.createServer();
      
      testServer.once('error', reject);
      testServer.once('listening', () => {
        testServers.push(testServer);
        resolve(testServer);
      });
      
      testServer.listen(port, '127.0.0.1');
    });
  }

  describe('server lifecycle', () => {
    it('should start and stop server successfully', async () => {
      expect(server.isRunning()).toBe(false);
      expect(server.getCurrentPort()).toBeNull();

      const port = await server.start();
      
      expect(server.isRunning()).toBe(true);
      expect(server.getCurrentPort()).toBe(port);
      expect(port).toBeGreaterThanOrEqual(58080);

      await server.stop();
      
      expect(server.isRunning()).toBe(false);
      expect(server.getCurrentPort()).toBeNull();
    });

    it('should handle shutdown errors gracefully', async () => {
      await server.start();
      expect(server.isRunning()).toBe(true);
      
      // Simulate a shutdown error by mocking the server.close method
      const internalServer = (server as any).server;
      if (internalServer) {
        const originalClose = internalServer.close;
        internalServer.close = (callback: (error?: Error) => void) => {
          // Simulate an error during shutdown
          setTimeout(() => callback(new Error('Simulated shutdown error')), 10);
        };
        
        // In development mode, this should reject
        if (process.env.NODE_ENV !== 'production') {
          await expect(server.stop()).rejects.toThrow('Simulated shutdown error');
        } else {
          // In production mode, it should resolve despite the error
          await server.stop();
        }
        
        // State should be reset even on error
        expect(server.isRunning()).toBe(false);
        expect(server.getCurrentPort()).toBeNull();
        
        // Restore original close method for cleanup
        internalServer.close = originalClose;
      }
    });

    it('should handle shutdown timeout gracefully', async () => {
      await server.start();
      expect(server.isRunning()).toBe(true);
      
      // Simulate a hanging shutdown by mocking the server.close method
      const internalServer = (server as any).server;
      if (internalServer) {
        const originalClose = internalServer.close;
        internalServer.close = (_callback: (error?: Error) => void) => {
          // Don't call the callback - simulate hanging
          // The timeout should kick in and resolve the promise
        };
        
        const startTime = Date.now();
        
        // Should resolve due to timeout (5 seconds)
        await server.stop();
        
        const duration = Date.now() - startTime;
        
        // Should have completed due to timeout
        expect(duration).toBeGreaterThanOrEqual(4950); // Allow some timing variance
        expect(duration).toBeLessThan(5500);
        
        // State should be reset
        expect(server.isRunning()).toBe(false);
        expect(server.getCurrentPort()).toBeNull();
        
        // Restore original close method for cleanup
        internalServer.close = originalClose;
      }
    }, 10000); // Increase test timeout to 10 seconds

    it('should not throw when stopping already stopped server', async () => {
      expect(server.isRunning()).toBe(false);
      
      // Should not throw
      await expect(server.stop()).resolves.toBeUndefined();
      
      expect(server.isRunning()).toBe(false);
    });

    it('should throw when starting already running server', async () => {
      await server.start();
      expect(server.isRunning()).toBe(true);
      
      await expect(server.start()).rejects.toThrow('Server is already running');
    });

    it('should find alternative port when default is occupied', async () => {
      const defaultPort = 58080;
      
      // Try to occupy the default port
      try {
        await occupyPort(defaultPort);
      } catch {
        // Port might already be occupied, that's fine for this test
      }
      
      const actualPort = await server.start();
      
      // Should have found a different port
      expect(actualPort).toBeGreaterThanOrEqual(defaultPort);
      expect(server.isRunning()).toBe(true);
      expect(server.getCurrentPort()).toBe(actualPort);
    });
  });

  describe('widget URL generation', () => {
    it('should generate correct widget URLs when running', async () => {
      const port = await server.start();
      
      const url = server.getWidgetUrl('standings');
      expect(url).toBe(`http://127.0.0.1:${port}/widget?type=standings`);
      
      const urlWithSpaces = server.getWidgetUrl('track map');
      expect(urlWithSpaces).toBe(`http://127.0.0.1:${port}/widget?type=track%20map`);
    });

    it('should throw when generating URLs for stopped server', () => {
      expect(server.isRunning()).toBe(false);
      
      expect(() => server.getWidgetUrl('standings')).toThrow('Server is not running');
    });
  });
});

describe('Widget type validation', () => {
  describe('isValidWidgetType', () => {
    it('should return true for all valid widget types', () => {
      VALID_WIDGET_TYPES.forEach(type => {
        expect(isValidWidgetType(type)).toBe(true);
      });
    });

    it('should return false for invalid widget types', () => {
      const invalidTypes = ['invalid', 'unknown', 'test', ''];
      invalidTypes.forEach(type => {
        expect(isValidWidgetType(type)).toBe(false);
      });
    });

    it('should return false for case-sensitive mismatches', () => {
      expect(isValidWidgetType('STANDINGS')).toBe(false);
      expect(isValidWidgetType('TrackMap')).toBe(false);
      expect(isValidWidgetType('Weather')).toBe(false);
    });

    it('should return false for partial matches', () => {
      expect(isValidWidgetType('stand')).toBe(false);
      expect(isValidWidgetType('trackma')).toBe(false);
      expect(isValidWidgetType('faster')).toBe(false);
    });
  });

  describe('validateWidgetParams', () => {
    it('should validate correct widget types', () => {
      VALID_WIDGET_TYPES.forEach(type => {
        const result = validateWidgetParams({ type });
        expect(result.valid).toBe(true);
        expect(result.type).toBe(type);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject missing type parameter', () => {
      const result = validateWidgetParams({});
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing required parameter: type');
      expect(result.type).toBeUndefined();
    });

    it('should reject invalid widget types', () => {
      const result = validateWidgetParams({ type: 'invalid' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid widget type: invalid. Valid types are: standings, trackmap, weather, input, relative, fastercars');
      expect(result.type).toBeUndefined();
    });

    it('should handle extra parameters gracefully', () => {
      const result = validateWidgetParams({ type: 'standings', extra: 'value' });
      expect(result.valid).toBe(true);
      expect(result.type).toBe('standings');
    });
  });

  describe('createWidgetErrorResponse', () => {
    it('should create error response with correct structure', () => {
      const error = 'Test error message';
      const response = createWidgetErrorResponse(error);
      
      expect(response.status).toBe(400);
      expect(response.json.error).toBe('Invalid widget request');
      expect(response.json.message).toBe(error);
      expect(response.json.validTypes).toEqual(VALID_WIDGET_TYPES);
      expect(response.json.example).toBe('http://127.0.0.1:58080/widget?type=standings');
    });

    it('should allow custom status codes', () => {
      const response = createWidgetErrorResponse('Test error', 422);
      expect(response.status).toBe(422);
    });

    it('should include all valid widget types in response', () => {
      const response = createWidgetErrorResponse('Test error');
      expect(response.json.validTypes).toHaveLength(6);
      expect(response.json.validTypes).toContain('standings');
      expect(response.json.validTypes).toContain('trackmap');
      expect(response.json.validTypes).toContain('weather');
      expect(response.json.validTypes).toContain('input');
      expect(response.json.validTypes).toContain('relative');
      expect(response.json.validTypes).toContain('fastercars');
    });
  });

  describe('VALID_WIDGET_TYPES constant', () => {
    it('should contain exactly the expected widget types', () => {
      expect(VALID_WIDGET_TYPES).toHaveLength(6);
      expect(VALID_WIDGET_TYPES).toEqual([
        'standings',
        'trackmap',
        'weather',
        'input',
        'relative',
        'fastercars'
      ]);
    });

    it('should be frozen to prevent runtime modification', () => {
      // The array should be frozen to prevent modifications
      expect(Object.isFrozen(VALID_WIDGET_TYPES)).toBe(true);
      
      // Attempting to modify should fail in strict mode or be silently ignored
      const originalLength = VALID_WIDGET_TYPES.length;
      try {
        (VALID_WIDGET_TYPES as any).push('newtype');
      } catch {
        // Expected in strict mode
      }
      
      // Length should remain unchanged
      expect(VALID_WIDGET_TYPES).toHaveLength(originalLength);
    });
  });

  describe('createWidgetHtmlTemplate', () => {
    it('should generate HTML template with correct widget type', () => {
      const html = createWidgetHtmlTemplate('standings');
      
      expect(html).toContain('data-widget-type="standings"');
      expect(html).toContain('irdashies Standings');
      expect(html).toContain('Loading Standings...');
    });

    it('should include transparent background CSS', () => {
      const html = createWidgetHtmlTemplate('trackmap');
      
      expect(html).toContain('background: transparent !important');
      expect(html).toContain('overflow: hidden');
    });

    it('should include OBS-specific optimizations', () => {
      const html = createWidgetHtmlTemplate('weather');
      
      expect(html).toContain('-webkit-user-select: none');
      expect(html).toContain('user-select: none');
      expect(html).toContain('image-rendering: crisp-edges');
      expect(html).toContain('display: none'); // scrollbar hiding
    });

    it('should include widget configuration script', () => {
      const html = createWidgetHtmlTemplate('input');
      
      expect(html).toContain('window.WIDGET_CONFIG');
      expect(html).toContain("type: 'input'");
      expect(html).toContain("displayName: 'Input Trace'");
      expect(html).toContain("description: 'Driver input traces for throttle, brake, and steering'");
    });

    it('should generate correct HTML for all widget types', () => {
      VALID_WIDGET_TYPES.forEach(type => {
        const html = createWidgetHtmlTemplate(type);
        
        expect(html).toContain(`data-widget-type="${type}"`);
        expect(html).toContain(`irdashies ${WIDGET_DISPLAY_NAMES[type]}`);
        expect(html).toContain(`Loading ${WIDGET_DISPLAY_NAMES[type]}...`);
        expect(html).toContain(`type: '${type}'`);
        expect(html).toContain(`displayName: '${WIDGET_DISPLAY_NAMES[type]}'`);
        expect(html).toContain(`description: '${WIDGET_DESCRIPTIONS[type]}'`);
      });
    });

    it('should include meta tags for OBS Browser Source compatibility', () => {
      const html = createWidgetHtmlTemplate('relative');
      
      expect(html).toContain('<meta charset="UTF-8">');
      expect(html).toContain('<meta name="viewport"');
      expect(html).toContain('<meta name="format-detection" content="telephone=no">');
      expect(html).toContain('<meta name="apple-mobile-web-app-capable"');
    });

    it('should include enhanced OBS Browser Source meta tags', () => {
      const html = createWidgetHtmlTemplate('trackmap');
      
      // Enhanced compatibility tags
      expect(html).toContain('<meta http-equiv="X-UA-Compatible" content="IE=edge">');
      expect(html).toContain('<meta name="robots" content="noindex, nofollow, nosnippet">');
      expect(html).toContain('<meta name="referrer" content="no-referrer">');
      expect(html).toContain('<meta name="theme-color" content="transparent">');
      expect(html).toContain('<meta name="msapplication-TileColor" content="transparent">');
      
      // Performance optimization tags
      expect(html).toContain('<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">');
      expect(html).toContain('<meta http-equiv="Pragma" content="no-cache">');
      expect(html).toContain('<meta http-equiv="Expires" content="0">');
      
      // Mobile web app tags
      expect(html).toContain('<meta name="mobile-web-app-capable" content="yes">');
      expect(html).toContain('<meta name="application-name" content="irdashies Track Map">');
      expect(html).toContain('<meta name="apple-mobile-web-app-title" content="irdashies Track Map">');
    });

    it('should include loading and error state styles', () => {
      const html = createWidgetHtmlTemplate('fastercars');
      
      expect(html).toContain('.widget-loading');
      expect(html).toContain('.widget-error');
      expect(html).toContain('color: #ffffff'); // loading text color
      expect(html).toContain('color: #ff6b6b'); // error text color
    });

    it('should maintain transparent backgrounds throughout', () => {
      const html = createWidgetHtmlTemplate('standings');
      
      // Check that transparent background is enforced in multiple places
      const transparentOccurrences = (html.match(/background: transparent/g) || []).length;
      expect(transparentOccurrences).toBeGreaterThan(2);
      
      // Check root container transparency
      expect(html).toContain('#widget-root * {\n      background-color: transparent;\n    }');
    });

    it('should include script tag to load widget.js bundle', () => {
      const html = createWidgetHtmlTemplate('input');
      
      expect(html).toContain('<script src="/widget.js" defer></script>');
    });

    it('should include script tags in correct order', () => {
      const html = createWidgetHtmlTemplate('weather');
      
      // Widget config should come before widget bundle
      const configIndex = html.indexOf('window.WIDGET_CONFIG');
      const bundleIndex = html.indexOf('<script src="/widget.js"');
      
      expect(configIndex).toBeGreaterThan(-1);
      expect(bundleIndex).toBeGreaterThan(-1);
      expect(configIndex).toBeLessThan(bundleIndex);
    });

    it('should include optimized title and viewport meta tags', () => {
      const html = createWidgetHtmlTemplate('fastercars');
      
      // Check enhanced title
      expect(html).toContain('<title>irdashies Faster Cars from Behind Widget</title>');
      
      // Check enhanced viewport with OBS optimizations
      expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no">');
    });

    it('should generate dynamic title for all widget types', () => {
      VALID_WIDGET_TYPES.forEach(type => {
        const html = createWidgetHtmlTemplate(type);
        const expectedTitle = `<title>irdashies ${WIDGET_DISPLAY_NAMES[type]} Widget</title>`;
        
        expect(html).toContain(expectedTitle);
      });
    });
  });
});