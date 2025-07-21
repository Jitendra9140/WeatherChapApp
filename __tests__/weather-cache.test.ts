import { WeatherCache } from '../lib/weather-cache';
import { FormattedWeatherData } from '../lib/weather-formatter';

// Mock Date.now() to control time for testing
const originalDateNow = Date.now;
let mockNow = 1000;

beforeEach(() => {
  jest.clearAllMocks();
  Date.now = jest.fn(() => mockNow);
});

afterAll(() => {
  Date.now = originalDateNow;
});

describe('WeatherCache', () => {
  let cache: WeatherCache;
  const mockWeatherData: FormattedWeatherData = {
    location: 'Test City',
    temperature: 22,
    feelsLike: 24,
    condition: 'Sunny',
    humidity: 50,
    windSpeed: 10,
    gusts: 15,
    isValid: true,
    time: new Date(mockNow).toISOString()
  };

  beforeEach(() => {
    cache = new WeatherCache();
    mockNow = 1000; // Reset mock time
  });

  test('should store and retrieve weather data by location', () => {
    cache.set('Test City', mockWeatherData);
    const retrieved = cache.get('Test City');
    expect(retrieved).toEqual(mockWeatherData);
  });

  test('should store and retrieve weather data by coordinates', () => {
    const coords = { lat: 51.5074, lon: -0.1278 };
    cache.setByCoords(coords, mockWeatherData);
    const retrieved = cache.getByCoords(coords);
    expect(retrieved).toEqual(mockWeatherData);
  });

  test('should return null for non-existent location', () => {
    const retrieved = cache.get('Non-existent City');
    expect(retrieved).toBeNull();
  });

  test('should return null for non-existent coordinates', () => {
    const retrieved = cache.getByCoords({ lat: 0, lon: 0 });
    expect(retrieved).toBeNull();
  });

  test('should expire cached data after TTL', () => {
    // Set cache with default TTL (15 minutes)
    cache.set('Test City', mockWeatherData);
    
    // Verify data is cached
    expect(cache.get('Test City')).toEqual(mockWeatherData);
    
    // Move time forward by 16 minutes (past TTL)
    mockNow += 16 * 60 * 1000;
    
    // Data should now be expired
    expect(cache.get('Test City')).toBeNull();
  });

  test('should respect custom TTL', () => {
    // Set cache with 5 minute TTL
    cache.set('Test City', mockWeatherData, 5 * 60 * 1000);
    
    // Verify data is cached
    expect(cache.get('Test City')).toEqual(mockWeatherData);
    
    // Move time forward by 4 minutes (within TTL)
    mockNow += 4 * 60 * 1000;
    expect(cache.get('Test City')).toEqual(mockWeatherData);
    
    // Move time forward by another 2 minutes (past TTL)
    mockNow += 2 * 60 * 1000;
    expect(cache.get('Test City')).toBeNull();
  });

  test('should clear all cached data', () => {
    cache.set('City1', mockWeatherData);
    cache.set('City2', { ...mockWeatherData, location: 'City2' });
    cache.setByCoords({ lat: 1, lon: 1 }, mockWeatherData);
    
    // Verify data is cached
    expect(cache.get('City1')).not.toBeNull();
    expect(cache.get('City2')).not.toBeNull();
    expect(cache.getByCoords({ lat: 1, lon: 1 })).not.toBeNull();
    
    // Clear cache
    cache.clear();
    
    // Verify all data is cleared
    expect(cache.get('City1')).toBeNull();
    expect(cache.get('City2')).toBeNull();
    expect(cache.getByCoords({ lat: 1, lon: 1 })).toBeNull();
  });

  test('should handle coordinate precision correctly', () => {
    const coords1 = { lat: 51.5074, lon: -0.1278 };
    const coords2 = { lat: 51.5075, lon: -0.1279 }; // Very close but different
    
    cache.setByCoords(coords1, mockWeatherData);
    
    // Should find with exact match
    expect(cache.getByCoords(coords1)).toEqual(mockWeatherData);
    
    // Should not find with slightly different coordinates
    expect(cache.getByCoords(coords2)).toBeNull();
    
    // Should find with small precision differences (within rounding)
    expect(cache.getByCoords({ lat: 51.50741, lon: -0.12781 })).toEqual(mockWeatherData);
  });

  test('should handle case insensitivity for location names', () => {
    cache.set('London', mockWeatherData);
    
    // Should find regardless of case
    expect(cache.get('london')).toEqual(mockWeatherData);
    expect(cache.get('LONDON')).toEqual(mockWeatherData);
    expect(cache.get('London')).toEqual(mockWeatherData);
  });

  test('should update existing cache entry', () => {
    cache.set('Test City', mockWeatherData);
    
    const updatedData = {
      ...mockWeatherData,
      temperature: 25,
      condition: 'Cloudy'
    };
    
    cache.set('Test City', updatedData);
    
    // Should return updated data
    expect(cache.get('Test City')).toEqual(updatedData);
  });
});