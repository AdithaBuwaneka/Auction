/**
 * WebSocket Service for Real-Time Updates
 *
 * This service provides WebSocket connectivity to the backend for real-time auction updates.
 * The backend supports WebSocket connections at:
 * - ws://localhost:8080/ws/auctions - Real-time auction updates
 * - ws://localhost:8080/ws/bids - Real-time bid notifications
 * - ws://localhost:8080/ws/notifications - Real-time user notifications
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type MessageHandler = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscriptions: Map<string, any> = new Map();
  private messageHandlers: Map<string, MessageHandler[]> = new Map();

  /**
   * Connect to the WebSocket server
   */
  connect(onConnected?: () => void, onError?: (error: any) => void) {
    if (this.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

    this.client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[WebSocket Debug]', str);
      },
      onConnect: () => {
        console.log('WebSocket Connected');
        this.connected = true;
        if (onConnected) onConnected();
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        this.connected = false;
        this.subscriptions.clear();
      },
      onStompError: (frame) => {
        console.error('WebSocket Error:', frame);
        if (onError) onError(frame);
      },
    });

    try {
      this.client.activate();
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      if (onError) onError(error);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      this.messageHandlers.clear();
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Subscribe to auction updates
   */
  subscribeToAuctionUpdates(auctionId: number, handler: MessageHandler) {
    if (!this.connected || !this.client) {
      console.warn('WebSocket not connected. Cannot subscribe to auction updates.');
      return null;
    }

    const topic = `/topic/auction/${auctionId}`;

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error('Error parsing auction update:', error);
      }
    });

    this.subscriptions.set(`auction-${auctionId}`, subscription);
    console.log(`Subscribed to auction ${auctionId}`);

    return subscription;
  }

  /**
   * Subscribe to bid notifications
   */
  subscribeToBidNotifications(userId: number, handler: MessageHandler) {
    if (!this.connected || !this.client) {
      console.warn('WebSocket not connected. Cannot subscribe to bid notifications.');
      return null;
    }

    const topic = `/user/${userId}/queue/bids`;

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error('Error parsing bid notification:', error);
      }
    });

    this.subscriptions.set(`bids-${userId}`, subscription);
    console.log(`Subscribed to bid notifications for user ${userId}`);

    return subscription;
  }

  /**
   * Subscribe to user notifications
   */
  subscribeToNotifications(userId: number, handler: MessageHandler) {
    if (!this.connected || !this.client) {
      console.warn('WebSocket not connected. Cannot subscribe to notifications.');
      return null;
    }

    const topic = `/user/${userId}/queue/notifications`;

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    this.subscriptions.set(`notifications-${userId}`, subscription);
    console.log(`Subscribed to notifications for user ${userId}`);

    return subscription;
  }

  /**
   * Subscribe to all auction updates (public)
   */
  subscribeToAllAuctions(handler: MessageHandler) {
    if (!this.connected || !this.client) {
      console.warn('WebSocket not connected. Cannot subscribe to all auctions.');
      return null;
    }

    const topic = '/topic/auctions';

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error('Error parsing auction broadcast:', error);
      }
    });

    this.subscriptions.set('all-auctions', subscription);
    console.log('Subscribed to all auction updates');

    return subscription;
  }

  /**
   * Unsubscribe from a specific topic
   */
  unsubscribe(subscriptionKey: string) {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      console.log(`Unsubscribed from ${subscriptionKey}`);
    }
  }

  /**
   * Send a message to the server
   */
  sendMessage(destination: string, body: any) {
    if (!this.connected || !this.client) {
      console.warn('WebSocket not connected. Cannot send message.');
      return;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
      console.log(`Message sent to ${destination}`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

// Export a singleton instance
export const websocketService = new WebSocketService();

export default websocketService;
