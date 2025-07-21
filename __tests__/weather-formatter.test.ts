import {
  formatWeatherData,
  generateWeatherDescription,
  isValidTemperature,
  isValidHumidity,
  isValidWindSpeed,
  isValidLocation,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  kmhToMph,
  mphToKmh,
  formatTemperature,
  formatWindSpeed,
  RawWeatherData,
  FormattedWeatherData
} from '../lib/weather-formatter';

describe('Weather Formatter Utilities', () => {
  // Unit conversion tests
  describe('Unit Conversions', () => {
    test('converts celsius to fahrenheit correctly', () => {
      expect(celsiusToFahrenheit(0)).toBeCloseTo(32);
      expect(celsiusToFahrenheit(100)).toBeCloseTo(212);
      expect(celsiusToFahrenheit(-40)).toBeCloseTo(-40);
      expect(celsiusToFahrenheit(21)).toBeCloseTo(69.8);
    });

    test('converts fahrenheit to celsius correctly', () => {
      expect(fahrenheitToCelsius(32)).toBeCloseTo(0);
      expect(fahrenheitToCelsius(212)).toBeCloseTo(100);
      expect(fahrenheitToCelsius(-40)).toBeCloseTo(-40);
      expect(fahrenheitToCelsius(70)).toBeCloseTo(21.11, 1);
    });

    test('converts km/h to mph correctly', () => {
      expect(kmhToMph(0)).toBeCloseTo(0);
      expect(kmhToMph(1)).toBeCloseTo(0.621371);
      expect(kmhToMph(100)).toBeCloseTo(62.1371);
      expect(kmhToMph(16.09)).toBeCloseTo(10, 1);
    });

    test('converts mph to km/h correctly', () => {
      expect(mphToKmh(0)).toBeCloseTo(0);
      expect(mphToKmh(1)).toBeCloseTo(1.60934);
      expect(mphToKmh(62.1371)).toBeCloseTo(100, 1);
      expect(mphToKmh(10)).toBeCloseTo(16.09, 1);
    });
  });

  // Validation function tests
  describe('Validation Functions', () => {
    test('validates temperature correctly', () => {
      expect(isValidTemperature(25)).toBe(true);
      expect(isValidTemperature(-10)).toBe(true);
      expect(isValidTemperature(0)).toBe(true);
      expect(isValidTemperature(-100)).toBe(false);
      expect(isValidTemperature(100)).toBe(false);
      expect(isValidTemperature('25')).toBe(false);
      expect(isValidTemperature(null)).toBe(false);
      expect(isValidTemperature(undefined)).toBe(false);
      expect(isValidTemperature(NaN)).toBe(false);
    });

    test('validates humidity correctly', () => {
      expect(isValidHumidity(50)).toBe(true);
      expect(isValidHumidity(0)).toBe(true);
      expect(isValidHumidity(100)).toBe(true);
      expect(isValidHumidity(-1)).toBe(false);
      expect(isValidHumidity(101)).toBe(false);
      expect(isValidHumidity('50')).toBe(false);
      expect(isValidHumidity(null)).toBe(false);
      expect(isValidHumidity(undefined)).toBe(false);
      expect(isValidHumidity(NaN)).toBe(false);
    });

    test('validates wind speed correctly', () => {
      expect(isValidWindSpeed(10)).toBe(true);
      expect(isValidWindSpeed(0)).toBe(true);
      expect(isValidWindSpeed(499)).toBe(true);
      expect(isValidWindSpeed(-1)).toBe(false);
      expect(isValidWindSpeed(500)).toBe(false);
      expect(isValidWindSpeed('10')).toBe(false);
      expect(isValidWindSpeed(null)).toBe(false);
      expect(isValidWindSpeed(undefined)).toBe(false);
      expect(isValidWindSpeed(NaN)).toBe(false);
    });

    test('validates location correctly', () => {
      expect(isValidLocation('London')).toBe(true);
      expect(isValidLocation('New York')).toBe(true);
      expect(isValidLocation('')).toBe(false);
      expect(isValidLocation('   ')).toBe(false);
      expect(isValidLocation(123 as any)).toBe(false);
      expect(isValidLocation(null as any)).toBe(false);
      expect(isValidLocation(undefined as any)).toBe(false);
    });
  });

  // Formatter function tests
  describe('formatWeatherData', () => {
    const validRawData: RawWeatherData = {
      location: 'Test City',
      temperature: 22.5,
      feelsLike: 24.0,
      humidity: 65,
      windSpeed: 12,
      windGust: 18,
      conditions: 'Partly Cloudy',
      pressure: 1013,
      visibility: 10,
      uvIndex: 5
    };

    test('formats valid weather data correctly', () => {
      const formatted = formatWeatherData(validRawData);
      expect(formatted.location).toBe('Test City');
      expect(formatted.temperature).toBe(22.5);
      expect(formatted.feelsLike).toBe(24.0);
      expect(formatted.humidity).toBe(65);
      expect(formatted.windSpeed).toBe(12);
      expect(formatted.gusts).toBe(18);
      expect(formatted.condition).toBe('Partly Cloudy');
      expect(formatted.pressure).toBe(1013);
      expect(formatted.visibility).toBe(10);
      expect(formatted.uvIndex).toBe(5);
      expect(formatted.isValid).toBe(true);
      expect(formatted.time).toBeDefined();
    });

    test('handles missing data with defaults', () => {
      const incompleteData: RawWeatherData = {
        location: 'Incomplete City',
        temperature: 18
      };

      const formatted = formatWeatherData(incompleteData);
      expect(formatted.location).toBe('Incomplete City');
      expect(formatted.temperature).toBe(18);
      expect(formatted.feelsLike).toBe(18); // Default to temperature
      expect(formatted.humidity).toBe(0); // Default
      expect(formatted.windSpeed).toBe(0); // Default
      expect(formatted.gusts).toBe(0); // Default
      expect(formatted.condition).toBe('Unknown conditions'); // Default
      expect(formatted.isValid).toBe(true);
    });

    test('handles invalid data', () => {
      const invalidData: RawWeatherData = {
        // Missing required fields
      };

      const formatted = formatWeatherData(invalidData);
      expect(formatted.location).toBe('Unknown Location');
      expect(formatted.temperature).toBe(0);
      expect(formatted.isValid).toBe(false);
    });

    test('validates data correctly', () => {
      const invalidTempData: RawWeatherData = {
        location: 'Invalid Temp',
        temperature: 150, // Invalid temperature
        humidity: 50
      };

      const formatted = formatWeatherData(invalidTempData);
      expect(formatted.location).toBe('Invalid Temp');
      expect(formatted.temperature).toBe(0); // Default due to invalid
      expect(formatted.isValid).toBe(false);
    });
  });

  describe('generateWeatherDescription', () => {
    test('generates correct description with all data', () => {
      const weatherData: FormattedWeatherData = {
        location: 'Test City',
        temperature: 22,
        feelsLike: 25,
        condition: 'partly cloudy',
        humidity: 75,
        windSpeed: 15,
        gusts: 25,
        isValid: true
      };

      const description = generateWeatherDescription(weatherData);
      expect(description).toContain('Test City');
      expect(description).toContain('22°C');
      expect(description).toContain('feels like 25°C');
      expect(description).toContain('high humidity of 75%');
      expect(description).toContain('partly cloudy');
      expect(description).toContain('wind is blowing at 15 km/h');
      expect(description).toContain('gusts up to 25 km/h');
    });

    test('handles same temperature and feels like', () => {
      const weatherData: FormattedWeatherData = {
        location: 'Same Temp City',
        temperature: 20,
        feelsLike: 20,
        condition: 'clear',
        humidity: 50,
        windSpeed: 10,
        gusts: 10,
        isValid: true
      };

      const description = generateWeatherDescription(weatherData);
      expect(description).toContain('Same Temp City');
      expect(description).toContain('20°C');
      expect(description).not.toContain('feels like');
      expect(description).toContain('humidity at 50%');
    });

    test('handles no wind gusts', () => {
      const weatherData: FormattedWeatherData = {
        location: 'No Gusts City',
        temperature: 18,
        feelsLike: 17,
        condition: 'windy',
        humidity: 40,
        windSpeed: 20,
        gusts: 20, // Same as wind speed
        isValid: true
      };

      const description = generateWeatherDescription(weatherData);
      expect(description).toContain('wind is blowing at 20 km/h');
      expect(description).not.toContain('gusts');
    });

    test('handles invalid data', () => {
      const invalidData: FormattedWeatherData = {
        location: 'Invalid City',
        temperature: 0,
        feelsLike: 0,
        condition: 'Unknown conditions',
        humidity: 0,
        windSpeed: 0,
        gusts: 0,
        isValid: false
      };

      const description = generateWeatherDescription(invalidData);
      expect(description).toBe('Weather information is currently unavailable.');
    });
  });

  describe('Format Functions', () => {
    test('formats temperature correctly', () => {
      expect(formatTemperature(25)).toBe('25°C');
      expect(formatTemperature(25.6)).toBe('26°C'); // Rounds
      expect(formatTemperature(25, 'C')).toBe('25°C');
      expect(formatTemperature(25, 'F')).toBe('77°F');
      expect(formatTemperature(0, 'F')).toBe('32°F');
    });

    test('formats wind speed correctly', () => {
      expect(formatWindSpeed(15)).toBe('15 km/h');
      expect(formatWindSpeed(15.6)).toBe('16 km/h'); // Rounds
      expect(formatWindSpeed(15, 'kmh')).toBe('15 km/h');
      expect(formatWindSpeed(15, 'mph')).toBe('9 mph');
      expect(formatWindSpeed(0, 'mph')).toBe('0 mph');
    });
  });
});