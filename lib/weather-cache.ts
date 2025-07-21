import { FormattedWeatherData } from './weather-formatter';

interface CacheEntry {
  data: FormattedWeatherData;
  timestamp: number;
  expiresAt: number;
}

interface LocationCache {
  [location: string]: CacheEntry;
}

interface CoordinatesCache {
  [key: string]: CacheEntry;
}

/**
 * Weather data caching mechanism
 */
export class WeatherCache {
  private locationCache: LocationCache = {};
  private coordinatesCache: CoordinatesCache = {};
  private defaultTTL: number = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  /**
   * Store weather data by location name
   */
  setByLocation(location: string, data: FormattedWeatherData, ttl?: number): void {
    const normalizedLocation = location.toLowerCase().trim();
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.locationCache[normalizedLocation] = {
      data,
      timestamp: now,
      expiresAt
    };
  }
  
  /**
   * Retrieve weather data by location name
   */
  getByLocation(location: string): FormattedWeatherData | null {
    const normalizedLocation = location.toLowerCase().trim();
    const entry = this.locationCache[normalizedLocation];
    
    if (!entry) return null;
    
    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      delete this.locationCache[normalizedLocation];
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Store weather data by coordinates
   */
  setByCoordinates(lat: number, lon: number, data: FormattedWeatherData, ttl?: number): void {
    const key = this.getCoordinatesKey(lat, lon);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.coordinatesCache[key] = {
      data,
      timestamp: now,
      expiresAt
    };
  }
  
  /**
   * Retrieve weather data by coordinates
   */
  getByCoordinates(lat: number, lon: number): FormattedWeatherData | null {
    const key = this.getCoordinatesKey(lat, lon);
    const entry = this.coordinatesCache[key];
    
    if (!entry) return null;
    
    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      delete this.coordinatesCache[key];
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.locationCache = {};
    this.coordinatesCache = {};
  }
  
  /**
   * Generate a cache key for coordinates
   */
  private getCoordinatesKey(lat: number, lon: number): string {
    return `${lat.toFixed(2)},${lon.toFixed(2)}`;
  }
}

// Export a singleton instance
export const weatherCache = new WeatherCache();