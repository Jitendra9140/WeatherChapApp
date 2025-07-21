"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { formatWeatherData, RawWeatherData, FormattedWeatherData } from '@/lib/weather-formatter';
import { weatherCache } from '@/lib/weather-cache';

type TemperatureUnit = 'C' | 'F';
type WindSpeedUnit = 'kmh' | 'mph';

interface WeatherContextType {
  // Weather data state
  currentWeather: FormattedWeatherData | null;
  isLoading: boolean;
  error: string | null;
  
  // Unit preferences
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  
  // Actions
  fetchWeatherByLocation: (location: string) => Promise<FormattedWeatherData | null>;
  fetchWeatherByCoordinates: (lat: number, lon: number) => Promise<FormattedWeatherData | null>;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

export const WeatherProvider: React.FC<WeatherProviderProps> = ({ children }) => {
  // Weather data state
  const [currentWeather, setCurrentWeather] = useState<FormattedWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Unit preferences with defaults
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('C');
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>('kmh');
  
  // Fetch weather data by location name
  const fetchWeatherByLocation = useCallback(async (location: string): Promise<FormattedWeatherData | null> => {
    if (!location.trim()) {
      setError('Please provide a valid location');
      return null;
    }
    
    // Check cache first
    const cachedData = weatherCache.getByLocation(location);
    if (cachedData) {
      setCurrentWeather(cachedData);
      setError(null);
      return cachedData;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be a real API call in a production app
      // For this example, we'll simulate a response
      const mockData: RawWeatherData = {
        location: location,
        temperature: 22 + Math.random() * 10,
        feelsLike: 23 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        windGust: 10 + Math.random() * 20,
        conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 5)],
        pressure: 1010 + Math.random() * 20,
        visibility: 5 + Math.random() * 10,
        uvIndex: Math.floor(1 + Math.random() * 10),
      };
      
      // Format the data
      const formattedData = formatWeatherData(mockData);
      
      // Cache the result
      weatherCache.setByLocation(location, formattedData);
      
      // Update state
      setCurrentWeather(formattedData);
      return formattedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch weather data by coordinates
  const fetchWeatherByCoordinates = useCallback(async (lat: number, lon: number): Promise<FormattedWeatherData | null> => {
    if (isNaN(lat) || isNaN(lon)) {
      setError('Please provide valid coordinates');
      return null;
    }
    
    // Round coordinates to 2 decimal places for caching
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    
    // Check cache first
    const cachedData = weatherCache.getByCoordinates(roundedLat, roundedLon);
    if (cachedData) {
      setCurrentWeather(cachedData);
      setError(null);
      return cachedData;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be a real API call in a production app
      // For this example, we'll simulate a response
      const mockData: RawWeatherData = {
        location: `Location at ${roundedLat.toFixed(2)}, ${roundedLon.toFixed(2)}`,
        temperature: 22 + Math.random() * 10,
        feelsLike: 23 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        windGust: 10 + Math.random() * 20,
        conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 5)],
        pressure: 1010 + Math.random() * 20,
        visibility: 5 + Math.random() * 10,
        uvIndex: Math.floor(1 + Math.random() * 10),
      };
      
      // Format the data
      const formattedData = formatWeatherData(mockData);
      
      // Cache the result
      weatherCache.setByCoordinates(roundedLat, roundedLon, formattedData);
      
      // Update state
      setCurrentWeather(formattedData);
      return formattedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const value = {
    currentWeather,
    isLoading,
    error,
    temperatureUnit,
    windSpeedUnit,
    fetchWeatherByLocation,
    fetchWeatherByCoordinates,
    setTemperatureUnit,
    setWindSpeedUnit,
  };
  
  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

// Custom hook to use the weather context
export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};