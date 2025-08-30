import { Injectable, computed } from '@angular/core';
import { BaseStateService } from './base-state.service';

export interface NetworkState {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown';
  isSlowConnection: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  bandwidth: {
    downlink: number; // Mbps
    uplink: number;   // Mbps
    rtt: number;      // ms
  };
  requests: {
    active: number;
    failed: number;
    total: number;
  };
  retryQueue: Array<{
    id: string;
    url: string;
    method: string;
    data?: any;
    retryCount: number;
    timestamp: Date;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkStateService extends BaseStateService<NetworkState> {
  // Computed signals
  public readonly isOffline = computed(() => !this.state().isOnline);
  public readonly hasSlowConnection = computed(() => this.state().isSlowConnection);
  public readonly connectionQuality = computed(() => this.state().connectionQuality);
  public readonly hasActiveRequests = computed(() => this.state().requests.active > 0);
  public readonly hasFailedRequests = computed(() => this.state().requests.failed > 0);
  public readonly retryQueueLength = computed(() => this.state().retryQueue.length);

  constructor() {
    super({
      persist: false, // Network state shouldn't be persisted
      debounceMs: 100
    });

    this.initializeNetworkMonitoring();
  }

  protected getInitialState(): NetworkState {
    return {
      isOnline: navigator.onLine,
      connectionType: 'unknown',
      isSlowConnection: false,
      lastOnlineAt: navigator.onLine ? new Date() : null,
      lastOfflineAt: navigator.onLine ? null : new Date(),
      connectionQuality: navigator.onLine ? 'good' : 'offline',
      bandwidth: {
        downlink: 0,
        uplink: 0,
        rtt: 0
      },
      requests: {
        active: 0,
        failed: 0,
        total: 0
      },
      retryQueue: []
    };
  }

  /**
   * Initialize network monitoring
   */
  private initializeNetworkMonitoring(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });

    // Monitor connection quality if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.updateConnectionInfo(connection);

      connection.addEventListener('change', () => {
        this.updateConnectionInfo(connection);
      });
    }

    // Initial connection check
    this.updateConnectionInfo();
  }

  /**
   * Handle coming online
   */
  private handleOnline(): void {
    const now = new Date();
    this.updateState({
      isOnline: true,
      lastOnlineAt: now,
      connectionQuality: 'good'
    });

    // Process retry queue
    this.processRetryQueue();
  }

  /**
   * Handle going offline
   */
  private handleOffline(): void {
    const now = new Date();
    this.updateState({
      isOnline: false,
      lastOfflineAt: now,
      connectionQuality: 'offline'
    });
  }

  /**
   * Update connection information
   */
  private updateConnectionInfo(connection?: any): void {
    if (!connection && !('connection' in navigator)) {
      return;
    }

    const conn = connection || (navigator as any).connection;

    if (conn) {
      const connectionType = this.mapConnectionType(conn.effectiveType || conn.type);
      const isSlowConnection = this.isConnectionSlow(conn);
      const connectionQuality = this.getConnectionQuality(conn);

      this.updateState({
        connectionType,
        isSlowConnection,
        connectionQuality,
        bandwidth: {
          downlink: conn.downlink || 0,
          uplink: conn.uplink || 0,
          rtt: conn.rtt || 0
        }
      });
    }
  }

  /**
   * Map connection type
   */
  private mapConnectionType(type: string): NetworkState['connectionType'] {
    switch (type) {
      case 'wifi':
      case 'wimax':
        return 'wifi';
      case 'cellular':
      case '2g':
      case '3g':
      case '4g':
        return 'cellular';
      case 'ethernet':
        return 'ethernet';
      case 'bluetooth':
        return 'bluetooth';
      default:
        return 'unknown';
    }
  }

  /**
   * Check if connection is slow
   */
  private isConnectionSlow(connection: any): boolean {
    if (!connection) return false;

    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink || 0;

    // Consider 2G, slow 3G, or very low bandwidth as slow
    return effectiveType === '2g' ||
           effectiveType === 'slow-2g' ||
           (effectiveType === '3g' && downlink < 1) ||
           downlink < 0.5;
  }

  /**
   * Get connection quality
   */
  private getConnectionQuality(connection: any): NetworkState['connectionQuality'] {
    if (!this.state().isOnline) return 'offline';

    if (!connection) return 'good';

    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink || 0;

    if (effectiveType === '4g' && downlink >= 5) return 'excellent';
    if (effectiveType === '4g' || (effectiveType === '3g' && downlink >= 1)) return 'good';
    if (effectiveType === '3g' || effectiveType === '2g') return 'poor';

    return downlink >= 2 ? 'good' : 'poor';
  }

  /**
   * Track request start
   */
  public trackRequestStart(): void {
    this.updateStateFn(current => ({
      ...current,
      requests: {
        ...current.requests,
        active: current.requests.active + 1,
        total: current.requests.total + 1
      }
    }));
  }

  /**
   * Track request completion
   */
  public trackRequestComplete(): void {
    this.updateStateFn(current => ({
      ...current,
      requests: {
        ...current.requests,
        active: Math.max(0, current.requests.active - 1)
      }
    }));
  }

  /**
   * Track request failure
   */
  public trackRequestFailure(): void {
    this.updateStateFn(current => ({
      ...current,
      requests: {
        ...current.requests,
        active: Math.max(0, current.requests.active - 1),
        failed: current.requests.failed + 1
      }
    }));
  }

  /**
   * Add request to retry queue
   */
  public addToRetryQueue(request: {
    id: string;
    url: string;
    method: string;
    data?: any;
  }): void {
    const retryItem = {
      ...request,
      retryCount: 0,
      timestamp: new Date()
    };

    this.updateStateFn(current => ({
      ...current,
      retryQueue: [...current.retryQueue, retryItem]
    }));
  }

  /**
   * Remove from retry queue
   */
  public removeFromRetryQueue(id: string): void {
    this.updateStateFn(current => ({
      ...current,
      retryQueue: current.retryQueue.filter(item => item.id !== id)
    }));
  }

  /**
   * Process retry queue
   */
  private async processRetryQueue(): Promise<void> {
    const queue = [...this.state().retryQueue];

    for (const item of queue) {
      try {
        // Implement retry logic here
        console.log('Retrying request:', item);

        // Remove from queue after successful retry
        this.removeFromRetryQueue(item.id);
      } catch (error) {
        console.error('Retry failed for request:', item.id, error);

        // Increment retry count
        this.updateStateFn(current => ({
          ...current,
          retryQueue: current.retryQueue.map(queueItem =>
            queueItem.id === item.id
              ? { ...queueItem, retryCount: queueItem.retryCount + 1 }
              : queueItem
          )
        }));
      }
    }
  }

  /**
   * Clear retry queue
   */
  public clearRetryQueue(): void {
    this.updateStateFn(current => ({
      ...current,
      retryQueue: []
    }));
  }

  /**
   * Get network status summary
   */
  public getNetworkStatus(): {
    isOnline: boolean;
    connectionType: string;
    quality: string;
    isSlow: boolean;
    activeRequests: number;
    failedRequests: number;
    retryQueueLength: number;
  } {
    const state = this.state();
    return {
      isOnline: state.isOnline,
      connectionType: state.connectionType,
      quality: state.connectionQuality,
      isSlow: state.isSlowConnection,
      activeRequests: state.requests.active,
      failedRequests: state.requests.failed,
      retryQueueLength: state.retryQueue.length
    };
  }

  /**
   * Check if should retry request
   */
  public shouldRetryRequest(maxRetries: number = 3): boolean {
    if (this.state().isOnline) return false;

    const queueLength = this.state().retryQueue.length;
    return queueLength < maxRetries;
  }

  /**
   * Get bandwidth info
   */
  public getBandwidthInfo(): NetworkState['bandwidth'] {
    return { ...this.state().bandwidth };
  }

  /**
   * Reset request counters
   */
  public resetRequestCounters(): void {
    this.updateStateFn(current => ({
      ...current,
      requests: {
        ...current.requests,
        failed: 0,
        total: 0
      }
    }));
  }

  /**
   * Force connection check
   */
  public async forceConnectionCheck(): Promise<boolean> {
    try {
      // Try to make a lightweight request to check connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const isOnline = response.ok;
      this.updateState({ isOnline });

      return isOnline;
    } catch (error) {
      this.updateState({ isOnline: false });
      return false;
    }
  }
}