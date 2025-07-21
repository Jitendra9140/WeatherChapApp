/**
 * Weather data formatting and utility functions
 */

// Raw weather data interface (input)
export interface RawWeatherData {
  location?: string;
  temperature?: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  windGust?: number;
  conditions?: string;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  dewPoint?: number;
}

// Formatted weather data interface (output)
export interface FormattedWeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  gusts?: number;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  dewPoint?: number;
  isValid: boolean;
  time?: string;
}

// Temperature unit conversion functions
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

// Wind speed unit conversion functions
export const kmhToMph = (kmh: number): number => {
  return kmh * 0.621371;
};

export const mphToKmh = (mph: number): number => {
  return mph * 1.60934;
};

// Validation functions
export const isValidTemperature = (temp: any): boolean => {
  return typeof temp === 'number' && !isNaN(temp) && temp > -100 && temp < 100;
};

export const isValidHumidity = (humidity: any): boolean => {
  return typeof humidity === 'number' && !isNaN(humidity) && humidity >= 0 && humidity <= 100;
};

export const isValidWindSpeed = (speed: any): boolean => {
  return typeof speed === 'number' && !isNaN(speed) && speed >= 0 && speed < 500;
};

export const isValidLocation = (location: any): boolean => {
  return typeof location === 'string' && location.trim().length > 0;
};

/**
 * Format raw weather data into standardized format
 * Simplified to trust data coming from the API
 */
export const formatWeatherData = (data: RawWeatherData): FormattedWeatherData => {
  // Create formatted data with direct values from API
  const formattedData: FormattedWeatherData = {
    location: data.location || 'Unknown Location',
    temperature: data.temperature || 0,
    feelsLike: data.feelsLike || data.temperature || 0,
    condition: data.conditions?.trim() || 'Unknown conditions',
    humidity: data.humidity || 0,
    windSpeed: data.windSpeed || 0,
    isValid: true, // Assume data from API is valid
    time: new Date().toISOString()
  };
  
  // Add optional fields directly
  if (data.windGust) {
    formattedData.gusts = data.windGust;
  }
  
  if (data.pressure) {
    formattedData.pressure = data.pressure;
  }
  
  if (data.visibility) {
    formattedData.visibility = data.visibility;
  }
  
  if (data.uvIndex) {
    formattedData.uvIndex = data.uvIndex;
  }
  
  if (data.dewPoint) {
    formattedData.dewPoint = data.dewPoint;
  }
  
  return formattedData;
};

/**
 * Generate a human-readable weather description
 */
export const generateWeatherDescription = (data: FormattedWeatherData): string => {
  if (!data.isValid) {
    return 'Weather information is currently unavailable.';
  }
  
  const parts: string[] = [];
  
  // Location and temperature
  parts.push(`The current temperature in ${data.location} is ${formatTemperature(data.temperature)}`);
  
  // Feels like temperature (if different)
  if (data.feelsLike !== data.temperature) {
    parts.push(`but it feels like ${formatTemperature(data.feelsLike)}`);
  }
  
  // Weather condition
  parts.push(`with ${data.condition.toLowerCase()}`);
  
  // Humidity
  if (data.humidity > 0) {
    const humidityDesc = data.humidity > 70 ? 'high humidity of' : 
                        data.humidity < 30 ? 'low humidity of' : 
                        'humidity at';
    parts.push(`${humidityDesc} ${data.humidity}%`);
  }
  
  // Wind information
  if (data.windSpeed > 0) {
    parts.push(`The wind is blowing at ${formatWindSpeed(data.windSpeed)}`);
    
    // Add gusts information if significantly higher than wind speed
    if (data.gusts && data.gusts > data.windSpeed) {
      parts.push(`with gusts up to ${formatWindSpeed(data.gusts)}`);
    }
  }
  
  return parts.join(', ') + '.';
};

/**
 * Format temperature with unit
 */
export const formatTemperature = (temp: number, unit: 'C' | 'F' = 'C'): string => {
  if (unit === 'F') {
    return `${Math.round(celsiusToFahrenheit(temp))}°F`;
  }
  return `${Math.round(temp)}°C`;
};

/**
 * Format wind speed with unit
 */
export const formatWindSpeed = (speed: number, unit: 'kmh' | 'mph' = 'kmh'): string => {
  if (unit === 'mph') {
    return `${Math.round(kmhToMph(speed))} mph`;
  }
  return `${Math.round(speed)} km/h`;
};