import { Injectable } from '@angular/core';
import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import { LocationData } from '../models';
import { ToastService } from './toast.service';
import { PlatformUtils } from '../utilities';

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  updateInterval?: number;
}

export interface LocationWatchOptions extends LocationOptions {
  updateInterval?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentLocationSubject = new BehaviorSubject<LocationData | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();

  private watchId: string | null = null;
  private isWatching = false;

  constructor(
    private platform: Platform,
    private toastService: ToastService,
    private platformUtils: PlatformUtils
  ) {}

  /**
   * Check if geolocation is available
   */
  async isLocationAvailable(): Promise<boolean> {
    try {
      if (!Capacitor.isPluginAvailable('Geolocation')) {
        return false;
      }

      // Check if geolocation is supported
      if ('geolocation' in navigator) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking location availability:', error);
      return false;
    }
  }

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (this.platformUtils.isWeb()) {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return result.state === 'granted';
      }

      // For native platforms, Capacitor handles permissions automatically
      const permissionStatus = await Geolocation.requestPermissions();
      return permissionStatus.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(options: LocationOptions = {}): Promise<LocationData | null> {
    try {
      // Check availability
      if (!(await this.isLocationAvailable())) {
        this.toastService.showError('Location services are not available');
        return null;
      }

      // Request permissions
      if (!(await this.requestPermissions())) {
        this.toastService.showError('Location permissions are required');
        return null;
      }

      const positionOptions: PositionOptions = {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000 // 5 minutes
      };

      const position = await Geolocation.getCurrentPosition(positionOptions);

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        timestamp: position.timestamp
      };

      // Update current location
      this.currentLocationSubject.next(locationData);

      return locationData;
    } catch (error: any) {
      console.error('Error getting current location:', error);

      let errorMessage = 'Failed to get current location';
      if (error.code) {
        switch (error.code) {
          case 1:
            errorMessage = 'Location access denied by user';
            break;
          case 2:
            errorMessage = 'Location information unavailable';
            break;
          case 3:
            errorMessage = 'Location request timed out';
            break;
        }
      }

      this.toastService.showError(errorMessage);
      return null;
    }
  }

  /**
   * Start watching location changes
   */
  async startWatchingLocation(options: LocationWatchOptions = {}): Promise<boolean> {
    try {
      if (this.isWatching) {
        console.warn('Location watching is already active');
        return true;
      }

      // Check availability
      if (!(await this.isLocationAvailable())) {
        this.toastService.showError('Location services are not available');
        return false;
      }

      // Request permissions
      if (!(await this.requestPermissions())) {
        this.toastService.showError('Location permissions are required');
        return false;
      }

      const positionOptions: PositionOptions = {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000
      };

      this.watchId = await Geolocation.watchPosition(positionOptions, (position, error) => {
        if (error) {
          console.error('Location watch error:', error);
          this.toastService.showError('Error watching location changes');
          return;
        }

        if (position) {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            timestamp: position.timestamp
          };

          this.currentLocationSubject.next(locationData);
        }
      });

      this.isWatching = true;
      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      this.toastService.showError('Failed to start location tracking');
      return false;
    }
  }

  /**
   * Stop watching location changes
   */
  async stopWatchingLocation(): Promise<void> {
    try {
      if (this.watchId && this.isWatching) {
        await Geolocation.clearWatch({ id: this.watchId });
        this.watchId = null;
        this.isWatching = false;
      }
    } catch (error) {
      console.error('Error stopping location watch:', error);
    }
  }

  /**
   * Get location updates as observable
   */
  getLocationUpdates(options: LocationWatchOptions = {}): Observable<LocationData> {
    return new Observable(observer => {
      let watchId: string | null = null;

      const startWatching = async () => {
        try {
          const positionOptions: PositionOptions = {
            enableHighAccuracy: options.enableHighAccuracy ?? true,
            timeout: options.timeout ?? 10000,
            maximumAge: options.maximumAge ?? 300000
          };

          watchId = await Geolocation.watchPosition(positionOptions, (position, error) => {
            if (error) {
              observer.error(error);
              return;
            }

            if (position) {
              const locationData: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude || undefined,
                timestamp: position.timestamp
              };

              observer.next(locationData);
            }
          });
        } catch (error) {
          observer.error(error);
        }
      };

      startWatching();

      // Cleanup function
      return () => {
        if (watchId) {
          Geolocation.clearWatch({ id: watchId });
        }
      };
    });
  }

  /**
   * Calculate distance between two locations
   */
  calculateDistance(
    location1: LocationData,
    location2: LocationData,
    unit: 'km' | 'miles' = 'km'
  ): number {
    const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles

    const dLat = this.toRadians(location2.latitude - location1.latitude);
    const dLon = this.toRadians(location2.longitude - location1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(location1.latitude)) * Math.cos(this.toRadians(location2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Check if location is within radius of another location
   */
  isWithinRadius(
    center: LocationData,
    target: LocationData,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(center, target, 'km');
    return distance <= radiusKm;
  }

  /**
   * Get address from coordinates (reverse geocoding)
   * Note: This is a placeholder - you would integrate with a geocoding service
   */
  async reverseGeocode(location: LocationData): Promise<any> {
    try {
      // Placeholder for reverse geocoding implementation
      // You would integrate with services like Google Maps, OpenStreetMap, etc.
      console.log('Reverse geocoding not implemented. Location:', location);
      return {
        address: 'Address lookup not available',
        city: 'Unknown',
        country: 'Unknown'
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Get coordinates from address (forward geocoding)
   * Note: This is a placeholder - you would integrate with a geocoding service
   */
  async forwardGeocode(address: string): Promise<LocationData | null> {
    try {
      // Placeholder for forward geocoding implementation
      console.log('Forward geocoding not implemented. Address:', address);
      return null;
    } catch (error) {
      console.error('Error forward geocoding:', error);
      return null;
    }
  }

  /**
   * Get location accuracy level
   */
  getAccuracyLevel(accuracy?: number): 'high' | 'medium' | 'low' {
    if (!accuracy) return 'low';
    if (accuracy <= 10) return 'high';
    if (accuracy <= 100) return 'medium';
    return 'low';
  }

  /**
   * Format location for display
   */
  formatLocation(location: LocationData, precision: number = 6): string {
    return `${location.latitude.toFixed(precision)}, ${location.longitude.toFixed(precision)}`;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get current location status
   */
  getLocationStatus(): {
    isWatching: boolean;
    hasCurrentLocation: boolean;
    currentLocation: LocationData | null;
  } {
    return {
      isWatching: this.isWatching,
      hasCurrentLocation: !!this.currentLocationSubject.value,
      currentLocation: this.currentLocationSubject.value
    };
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    await this.stopWatchingLocation();
    this.currentLocationSubject.next(null);
  }
}