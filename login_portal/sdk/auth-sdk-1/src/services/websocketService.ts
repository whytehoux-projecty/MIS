/**
 * WebSocket Service for Real-time QR Scan Detection
 * 
 * Provides instant notification when a QR code is scanned,
 * replacing the polling mechanism for better user experience.
 */

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface QRStatusUpdate {
    qrToken: string;
    scanned: boolean;
    verified: boolean;
    timestamp: number;
}

export interface WebSocketServiceConfig {
    /** WebSocket server URL */
    url: string;
    /** Reconnection attempts (default: 3) */
    maxReconnectAttempts?: number;
    /** Delay between reconnection attempts in ms (default: 1000) */
    reconnectDelay?: number;
    /** Heartbeat interval in ms (default: 30000) */
    heartbeatInterval?: number;
}

type MessageHandler = (update: QRStatusUpdate) => void;
type StatusHandler = (status: WebSocketStatus) => void;

export class WebSocketService {
    private ws: WebSocket | null = null;
    private config: Required<WebSocketServiceConfig>;
    private messageHandlers: Map<string, MessageHandler> = new Map();
    private statusHandlers: Set<StatusHandler> = new Set();
    private status: WebSocketStatus = 'disconnected';
    private reconnectAttempts = 0;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private subscribedTokens: Set<string> = new Set();

    constructor(config: WebSocketServiceConfig) {
        this.config = {
            url: config.url,
            maxReconnectAttempts: config.maxReconnectAttempts ?? 3,
            reconnectDelay: config.reconnectDelay ?? 1000,
            heartbeatInterval: config.heartbeatInterval ?? 30000,
        };
    }

    /**
     * Connect to the WebSocket server
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            try {
                this.updateStatus('connecting');
                this.ws = new WebSocket(this.config.url);

                this.ws.onopen = () => {
                    this.updateStatus('connected');
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();

                    // Re-subscribe to any existing tokens
                    this.subscribedTokens.forEach(token => {
                        this.sendSubscribe(token);
                    });

                    resolve();
                };

                this.ws.onclose = () => {
                    this.handleDisconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('[WebSocket] Error:', error);
                    this.updateStatus('error');
                    reject(new Error('WebSocket connection failed'));
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
            } catch (error) {
                this.updateStatus('error');
                reject(error);
            }
        });
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void {
        this.stopHeartbeat();
        this.subscribedTokens.clear();
        this.messageHandlers.clear();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.updateStatus('disconnected');
    }

    /**
     * Subscribe to QR token status updates
     */
    subscribe(qrToken: string, handler: MessageHandler): () => void {
        this.subscribedTokens.add(qrToken);
        this.messageHandlers.set(qrToken, handler);

        // Send subscribe message if connected
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.sendSubscribe(qrToken);
        }

        // Return unsubscribe function
        return () => {
            this.unsubscribe(qrToken);
        };
    }

    /**
     * Unsubscribe from QR token updates
     */
    unsubscribe(qrToken: string): void {
        this.subscribedTokens.delete(qrToken);
        this.messageHandlers.delete(qrToken);

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.send({
                type: 'unsubscribe',
                qrToken,
            });
        }
    }

    /**
     * Add a status change handler
     */
    onStatusChange(handler: StatusHandler): () => void {
        this.statusHandlers.add(handler);
        // Immediately notify of current status
        handler(this.status);

        return () => {
            this.statusHandlers.delete(handler);
        };
    }

    /**
     * Get current connection status
     */
    getStatus(): WebSocketStatus {
        return this.status;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    // Private methods

    private sendSubscribe(qrToken: string): void {
        this.send({
            type: 'subscribe',
            qrToken,
        });
    }

    private send(data: unknown): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    private handleMessage(data: string): void {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'qr_status':
                    this.handleQRStatus(message);
                    break;
                case 'pong':
                    // Heartbeat response, ignore
                    break;
                case 'error':
                    console.error('[WebSocket] Server error:', message.error);
                    break;
                default:
                    console.log('[WebSocket] Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
        }
    }

    private handleQRStatus(message: { qrToken: string; scanned: boolean; verified: boolean }): void {
        const update: QRStatusUpdate = {
            qrToken: message.qrToken,
            scanned: message.scanned,
            verified: message.verified,
            timestamp: Date.now(),
        };

        const handler = this.messageHandlers.get(message.qrToken);
        if (handler) {
            handler(update);
        }
    }

    private handleDisconnect(): void {
        this.stopHeartbeat();
        this.updateStatus('disconnected');

        // Attempt to reconnect
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[WebSocket] Reconnecting (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.connect().catch(() => {
                    console.error('[WebSocket] Reconnection failed');
                });
            }, this.config.reconnectDelay * this.reconnectAttempts);
        }
    }

    private updateStatus(status: WebSocketStatus): void {
        this.status = status;
        this.statusHandlers.forEach(handler => handler(status));
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            this.send({ type: 'ping' });
        }, this.config.heartbeatInterval);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}

/**
 * Create a WebSocket service instance
 */
export function createWebSocketService(config: WebSocketServiceConfig): WebSocketService {
    return new WebSocketService(config);
}

/**
 * Check if WebSocket is supported in the current environment
 */
export function isWebSocketSupported(): boolean {
    return typeof WebSocket !== 'undefined';
}
