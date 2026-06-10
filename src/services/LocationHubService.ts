import * as signalR from '@microsoft/signalr';
import {getLocalStorage} from '../utils/helper';
import {SERVER_URL} from '../config';

export interface RideAcceptedData {
  rideSessionId: string;
  status: string;
  driverId: string;
}

export interface DriverLocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  timestamp: string;
}

class LocationHubService {
  private connection: signalR.HubConnection | null = null;
  // Manual retry only for initial connection failures.
  // Drop-reconnect after connected is handled by withAutomaticReconnect.
  private initialConnectAttempts = 0;
  private readonly maxInitialConnectAttempts = 10;
  private readonly baseReconnectDelay = 3000;

  async connect(): Promise<void> {
    if (
      this.connection?.state === signalR.HubConnectionState.Connected ||
      this.connection?.state === signalR.HubConnectionState.Connecting ||
      this.connection?.state === signalR.HubConnectionState.Reconnecting
    ) {
      return;
    }

    try {
      const token = await getLocalStorage('token');
      if (!token) {
        console.warn('[SignalR] No auth token — cannot connect');
        return;
      }

      const hubUrl = SERVER_URL.replace(/\/api$/, '') + '/hubs/location';

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          // Returns null after 8 drop-reconnect attempts to let onclose fire
          nextRetryDelayInMilliseconds: retryContext => {
            if (retryContext.previousRetryCount >= 8) return null;
            return Math.min(
              this.baseReconnectDelay * (retryContext.previousRetryCount + 1),
              30000,
            );
          },
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.onreconnecting(() =>
        console.warn('[SignalR] Reconnecting...'),
      );

      this.connection.onreconnected(() => {
        if (__DEV__) console.log('[SignalR] Reconnected — re-registering as passenger');
        this.initialConnectAttempts = 0;
        this.connection?.invoke('RegisterAsPassenger').catch(console.error);
      });

      // onclose fires when auto-reconnect gives up (returned null) or after .stop()
      this.connection.onclose(err => {
        console.warn('[SignalR] Connection closed', err?.message ?? '');
        // Only retry if closed due to an error (not an intentional .stop())
        if (err) {
          this.scheduleInitialReconnect();
        }
      });

      await this.connection.start();
      await this.connection.invoke('RegisterAsPassenger');
      this.initialConnectAttempts = 0;
      if (__DEV__) console.log('[SignalR] Connected and registered as passenger');
    } catch (error) {
      console.error('[SignalR] Connection error:', error);
      this.scheduleInitialReconnect();
    }
  }

  private scheduleInitialReconnect(): void {
    if (this.initialConnectAttempts >= this.maxInitialConnectAttempts) {
      console.error('[SignalR] Max reconnect attempts reached. Will retry on next connect() call.');
      this.initialConnectAttempts = 0;
      return;
    }
    this.initialConnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelay * this.initialConnectAttempts,
      30000,
    );
    setTimeout(() => this.connect(), delay);
  }

  // -------------------------------------------------------------------------
  // Driver location subscription
  // -------------------------------------------------------------------------

  async subscribeToDriverLocation(driverId: string): Promise<void> {
    if (!this.isConnected()) return;
    try {
      await this.connection!.invoke('SubscribeToDriverLocation', driverId);
    } catch (error) {
      console.error('[SignalR] subscribeToDriverLocation error:', error);
    }
  }

  async unsubscribeFromDriverLocation(driverId: string): Promise<void> {
    if (!this.isConnected()) return;
    try {
      await this.connection!.invoke('UnsubscribeFromDriverLocation', driverId);
    } catch (error) {
      console.error('[SignalR] unsubscribeFromDriverLocation error:', error);
    }
  }

  // -------------------------------------------------------------------------
  // Event listeners
  // -------------------------------------------------------------------------

  onRideAccepted(callback: (data: RideAcceptedData) => void): void {
    this.connection?.on('RideAccepted', callback);
  }

  offRideAccepted(): void {
    this.connection?.off('RideAccepted');
  }

  onRideCancelled(callback: (rideSessionId: string) => void): void {
    this.connection?.on('RideCancelled', callback);
  }

  offRideCancelled(): void {
    this.connection?.off('RideCancelled');
  }

  onDriverRejected(callback: (rideSessionId: string) => void): void {
    this.connection?.on('DriverRejected', callback);
  }

  offDriverRejected(): void {
    this.connection?.off('DriverRejected');
  }

  onDriverLocationUpdate(
    callback: (update: DriverLocationUpdate) => void,
  ): void {
    this.connection?.on('ReceiveDriverLocation', callback);
  }

  offDriverLocationUpdate(): void {
    this.connection?.off('ReceiveDriverLocation');
  }

  onRideStarted(callback: (rideSessionId: string) => void): void {
    this.connection?.on('RideStarted', callback);
  }

  offRideStarted(): void {
    this.connection?.off('RideStarted');
  }

  onRideCompleted(
    callback: (payload: {
      rideSessionId: string;
      status: string;
      fare: number;
    }) => void,
  ): void {
    this.connection?.on('RideCompleted', callback);
  }

  offRideCompleted(): void {
    this.connection?.off('RideCompleted');
  }

  // -------------------------------------------------------------------------
  // Food delivery events (from PartnerController flow)
  // -------------------------------------------------------------------------

  onDeliveryAssigned(
    callback: (data: {deliveryId: string; orderId: string}) => void,
  ): void {
    this.connection?.on('DeliveryAssigned', callback);
  }
  offDeliveryAssigned(): void {
    this.connection?.off('DeliveryAssigned');
  }

  onDeliveryPickedUp(
    callback: (data: {
      deliveryId: string;
      orderId: string;
      deliveryOtp: string;
    }) => void,
  ): void {
    this.connection?.on('DeliveryPickedUp', callback);
  }
  offDeliveryPickedUp(): void {
    this.connection?.off('DeliveryPickedUp');
  }

  onDeliveryLocationUpdate(
    callback: (data: {
      deliveryId: string;
      orderId: string;
      latitude: number;
      longitude: number;
    }) => void,
  ): void {
    this.connection?.on('DeliveryLocationUpdate', callback);
  }
  offDeliveryLocationUpdate(): void {
    this.connection?.off('DeliveryLocationUpdate');
  }

  onDeliveryCompleted(
    callback: (data: {deliveryId: string; orderId: string}) => void,
  ): void {
    this.connection?.on('DeliveryCompleted', callback);
  }
  offDeliveryCompleted(): void {
    this.connection?.off('DeliveryCompleted');
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.initialConnectAttempts = this.maxInitialConnectAttempts; // block auto-retry
      await this.connection.stop().catch(console.error);
      this.connection = null;
      this.initialConnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const locationHubService = new LocationHubService();
