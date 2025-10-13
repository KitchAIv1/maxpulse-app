// Network Service
// Handles network state detection and monitoring
// Single responsibility: Network connectivity management

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkListener = (isConnected: boolean) => void;

class NetworkService {
  private static instance: NetworkService;
  private listeners: Set<NetworkListener> = new Set();
  private currentState: boolean = true; // Assume online initially
  private isInitialized: boolean = false;

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Get initial network state
      const state = await NetInfo.fetch();
      this.currentState = state.isConnected ?? true;
      
      // Subscribe to network state changes
      NetInfo.addEventListener(this.handleNetworkChange);
      
      this.isInitialized = true;
      console.log(`🌐 Network service initialized - Connected: ${this.currentState}`);
    } catch (error) {
      console.warn('Failed to initialize network service:', error);
      this.currentState = true; // Assume online on error
    }
  }

  /**
   * Check if device is currently online
   */
  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? true;
    } catch (error) {
      console.warn('Failed to check network state:', error);
      return true; // Assume online on error
    }
  }

  /**
   * Get current cached network state (synchronous)
   */
  isCurrentlyOnline(): boolean {
    return this.currentState;
  }

  /**
   * Add listener for network state changes
   */
  addListener(listener: NetworkListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: NetworkListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState): void => {
    const isConnected = state.isConnected ?? true;
    const wasConnected = this.currentState;
    
    this.currentState = isConnected;

    // Notify listeners if state changed
    if (isConnected !== wasConnected) {
      console.log(`🌐 Network state changed: ${wasConnected ? 'Online' : 'Offline'} → ${isConnected ? 'Online' : 'Offline'}`);
      
      this.listeners.forEach(listener => {
        try {
          listener(isConnected);
        } catch (error) {
          console.error('Network listener error:', error);
        }
      });
    }
  };
}

export default NetworkService;

