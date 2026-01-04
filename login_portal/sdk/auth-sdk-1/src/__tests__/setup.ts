/**
 * Test Setup for Central Auth SDK
 * 
 * Configures the testing environment for all test files.
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

// Mock WebSocket
class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    readyState = MockWebSocket.OPEN;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: ((error: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;

    constructor(_url: string) {
        setTimeout(() => {
            this.onopen?.();
        }, 0);
    }

    send = vi.fn();
    close = vi.fn(() => {
        this.readyState = MockWebSocket.CLOSED;
        this.onclose?.();
    });
}

Object.defineProperty(window, 'WebSocket', {
    value: MockWebSocket,
});

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
});

// Cleanup after each test
afterEach(() => {
    vi.restoreAllMocks();
});
