/**
 * WebSocket Service Tests
 * 
 * Note: These tests are simplified due to jsdom limitations with WebSocket mocking.
 * Full WebSocket integration tests would be better suited for E2E testing.
 */

import { describe, it, expect, vi } from 'vitest';
import { isWebSocketSupported } from '../../services/websocketService';

describe('WebSocket Service', () => {
    describe('isWebSocketSupported', () => {
        it('should be a function', () => {
            expect(typeof isWebSocketSupported).toBe('function');
        });

        it('should return a boolean', () => {
            const result = isWebSocketSupported();
            expect(typeof result).toBe('boolean');
        });

        // In jsdom, WebSocket is typically available
        it('should return true in jsdom environment', () => {
            expect(isWebSocketSupported()).toBe(true);
        });
    });
});

describe('WebSocket Service - Module Exports', () => {
    it('should export WebSocketService class', async () => {
        const module = await import('../../services/websocketService');
        expect(module.WebSocketService).toBeDefined();
    });

    it('should export createWebSocketService factory', async () => {
        const module = await import('../../services/websocketService');
        expect(module.createWebSocketService).toBeDefined();
        expect(typeof module.createWebSocketService).toBe('function');
    });

    it('should export isWebSocketSupported function', async () => {
        const module = await import('../../services/websocketService');
        expect(module.isWebSocketSupported).toBeDefined();
        expect(typeof module.isWebSocketSupported).toBe('function');
    });
});

describe('WebSocket Service - Configuration', () => {
    it('should accept configuration options', async () => {
        const { WebSocketService } = await import('../../services/websocketService');

        // Should not throw with valid config
        const service = new WebSocketService({
            url: 'wss://example.com/ws',
            maxReconnectAttempts: 3,
            reconnectDelay: 1000,
            heartbeatInterval: 30000,
        });

        expect(service).toBeDefined();
        expect(service.getStatus()).toBe('disconnected');
        expect(service.isConnected()).toBe(false);
    });

    it('should have default status of disconnected', async () => {
        const { WebSocketService } = await import('../../services/websocketService');

        const service = new WebSocketService({
            url: 'wss://example.com/ws',
        });

        expect(service.getStatus()).toBe('disconnected');
    });
});

describe('WebSocket Service - Methods', () => {
    it('should have connect method', async () => {
        const { WebSocketService } = await import('../../services/websocketService');

        const service = new WebSocketService({
            url: 'wss://example.com/ws',
        });

        expect(typeof service.connect).toBe('function');
    });

    it('should have disconnect method', async () => {
        const { WebSocketService } = await import('../../services/websocketService');

        const service = new WebSocketService({
            url: 'wss://example.com/ws',
        });

        expect(typeof service.disconnect).toBe('function');
    });

    it('should have subscribe method', async () => {
        const { WebSocketService } = await import('../../services/websocketService');

        const service = new WebSocketService({
            url: 'wss://example.com/ws',
        });

        expect(typeof service.subscribe).toBe('function');
    });

    it('should have onStatusChange method', async () => {
        const { WebSocketService } = await import('../../services/websocketService');

        const service = new WebSocketService({
            url: 'wss://example.com/ws',
        });

        expect(typeof service.onStatusChange).toBe('function');
    });

    it('should call status change callback with initial status', async () => {
        const { WebSocketService } = await import('../../services/websocketService');

        const service = new WebSocketService({
            url: 'wss://example.com/ws',
        });

        const callback = vi.fn();
        service.onStatusChange(callback);

        expect(callback).toHaveBeenCalledWith('disconnected');
    });

    it('should return unsubscribe function from onStatusChange', async () => {
        const { WebSocketService } = await import('../../services/websocketService');

        const service = new WebSocketService({
            url: 'wss://example.com/ws',
        });

        const callback = vi.fn();
        const unsubscribe = service.onStatusChange(callback);

        expect(typeof unsubscribe).toBe('function');
    });
});

describe('WebSocket Service - Factory', () => {
    it('should create service with factory function', async () => {
        const { createWebSocketService } = await import('../../services/websocketService');

        const service = createWebSocketService({
            url: 'wss://example.com/ws',
        });

        expect(service).toBeDefined();
        expect(service.getStatus()).toBe('disconnected');
    });
});
