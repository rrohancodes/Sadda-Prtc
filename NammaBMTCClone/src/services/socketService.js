import { io } from 'socket.io-client';
import Constants from 'expo-constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL || 'http://10.84.2.139:3001'; // TODO: set to your LAN IP
    console.log('[Socket] Using serverUrl:', this.serverUrl);
    this.retryAttempts = 0;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket','polling'], // allow fallback
      timeout: 9000,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      forceNew: true,
      autoConnect: true,
      path: '/socket.io'
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server', this.socket.id);
      this.isConnected = true;
      this.retryAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error?.message || error);
      this.isConnected = false;
      this.retryAttempts += 1;
      const delay = Math.min(1000 * Math.pow(1.4, this.retryAttempts), 10000);
      console.log(`[Socket] Retry #${this.retryAttempts} in ${Math.round(delay)}ms`);
      if(!this.socket.connecting){
        setTimeout(()=>{
          if(!this.isConnected){
            try { this.socket.connect(); } catch(e){ console.log('Reconnect attempt failed setup', e.message); }
          }
        }, delay);
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  // Bus tracking methods
  trackBus(busId, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, attempting to connect...');
      this.connect();
    }

    if (this.socket) {
      console.log(`🚌 Tracking bus: ${busId}`);
      this.socket.emit('track-bus', busId);
      
      this.socket.on('bus-location-update', (data) => {
        if (data.busId === busId) {
          callback(data);
        }
      });
    }
  }

  stopTrackingBus(busId) {
    if (this.socket && this.isConnected) {
      console.log(`🛑 Stopped tracking bus: ${busId}`);
      this.socket.emit('stop-tracking', busId);
      this.socket.off('bus-location-update');
    }
  }

  // Route tracking methods
  trackRoute(routeId, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, attempting to connect...');
      this.connect();
    }

    if (this.socket) {
      console.log(`🛣️ Tracking route: ${routeId}`);
      this.socket.emit('track-route', routeId);
      
      this.socket.on('route-update', (data) => {
        if (data.routeId === routeId) {
          callback(data);
        }
      });
    }
  }

  stopTrackingRoute(routeId) {
    if (this.socket && this.isConnected) {
      console.log(`🛑 Stopped tracking route: ${routeId}`);
      this.socket.emit('stop-tracking', routeId);
      this.socket.off('route-update');
    }
  }

  // Corridor tracking
  trackCorridor(key, callback){
    if(!this.socket || !this.isConnected) this.connect();
    if(this.socket){
      this.socket.emit('track-corridor', key);
      this.socket.on('corridor-update', (data)=>{
        if(data && data.type && data.tripId) callback(data);
      });
    }
  }
  stopTrackingCorridor(key){
    if(this.socket && this.isConnected){
      this.socket.emit('stop-tracking', key);
      this.socket.off('corridor-update');
    }
  }
  // Trip tracking
  trackTrip(tripId, callback){
    if(!this.socket || !this.isConnected) this.connect();
    if(this.socket){
      this.socket.emit('track-trip', tripId);
      this.socket.on('trip-update', (data)=>{ if(data.tripId===tripId) callback(data); });
      this.socket.on('trip-ended', (data)=>{ if(data.tripId===tripId) callback({ ended:true, ...data }); });
    }
  }
  stopTrackingTrip(tripId){
    if(this.socket && this.isConnected){
      this.socket.emit('stop-tracking', tripId);
      this.socket.off('trip-update');
      this.socket.off('trip-ended');
    }
  }

  // General event listeners
  onBusLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('bus-location-update', callback);
    }
  }

  onRouteUpdate(callback) {
    if (this.socket) {
      this.socket.on('route-update', callback);
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
