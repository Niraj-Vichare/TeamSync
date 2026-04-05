import * as signalR from "@microsoft/signalr";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

/**
 * Notification SignalR service.
 *
 * On connect the server automatically joins the user to their personal group
 * "user:{profileGuid}" — no client invoke needed (see NotificationHub.cs).
 *
 * Usage:
 *   // Connect once after login (e.g. in AuthContext or a top-level component)
 *   await notificationHubService.connect();
 *
 *   // Register a listener wherever you render the bell icon
 *   notificationHubService.onNotification((notification) => {
 *     setNotifications(prev => [notification, ...prev]);
 *     setUnreadCount(c => c + 1);
 *   });
 *
 *   // Disconnect on logout
 *   await notificationHubService.disconnect();
 */
class NotificationHubService {
  constructor() {
    this.connection  = null;
    this.isConnected = false;
    this._listeners  = [];        
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/notifications`, {
          // Cookie-based auth — withCredentials ensures the httpOnly cookie
          // is forwarded automatically; no manual token needed.
          withCredentials: true,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Re-register listeners after an automatic reconnect
      this.connection.onreconnected(() => {
        console.log("🔔 NotificationHub reconnected");
      });

      this.connection.onclose(() => {
        this.isConnected = false;
        console.log("🔔 NotificationHub disconnected");
      });

      // Server pushes to this event name from NotificationHubService.cs
      this.connection.on("ReceiveNotification", (notification) => {
        this._listeners.forEach((cb) => cb(notification));
      });

      await this.connection.start();
      this.isConnected = true;
      console.log("🔔 NotificationHub connected");
    } catch (err) {
      this.isConnected = false;
      console.error("🔔 NotificationHub connection error:", err);
    }
  }

  /**
   * Register a callback that fires whenever a push notification arrives.
   * Call this once per component — remember to unregister on unmount
   * using the returned cleanup function.
   *
   * @param {function} callback  Receives the notification payload object.
   * @returns {function}         Call the returned function to unregister.
   */
  onNotification(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    };
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.isConnected = false;
      this._listeners  = [];
    }
  }
}

const notificationHubService = new NotificationHubService();
export default notificationHubService;