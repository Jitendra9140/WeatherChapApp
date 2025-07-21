import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { WeatherProvider, useWeather } from '../contexts/WeatherContext';
import { weatherCache } from '../lib/weather-cache';
import { FormattedWeatherData } from '../lib/weather-formatter';

// Mock the weather-cache module
jest.mock('../lib/weather-cache', () => {
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    getByCoords: jest.fn(),
    setByCoords: jest.fn(),
    clear: jest.fn()
  };
  return { weatherCache: mockCache };
});

// Mock fetch
global.fetch = jest.fn();

// Test component that uses the useWeather hook
const TestComponent = () => {
  const { 
    weatherData, 
    loading, 
    error, 
    fetchWeatherByLocation, 
    fetchWeatherByCoordinates,
    setTemperatureUnit,
    setWindSpeedUnit,
    temperatureUnit,
    windSpeedUnit
  } = useWeather();

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {weatherData && (
        <div data-testid="weather-data">
          <div data-testid="location">{weatherData.location}</div>
          <div data-testid="temperature">{weatherData.temperature}</div>
          <div data-testid="condition">{weatherData.condition}</div>
          <div data-testid="temp-unit">{temperatureUnit}</div>
          <div data-testid="wind-unit">{windSpeedUnit}</div>
        </div>
      )}
      <button 
        data-testid="fetch-by-location" 
        onClick={() => fetchWeatherByLocation('London')}
      >
        Fetch London
      </button>
      <button 
        data-testid="fetch-by-coords" 
        onClick={() => fetchWeatherByCoordinates({ lat: 51.5074, lon: -0.1278 })}
      >
        Fetch by Coords
      </button>
      <button 
        data-testid="toggle-temp-unit" 
        onClick={() => setTemperatureUnit(temperatureUnit === 'C' ? 'F' : 'C')}
      >
        Toggle Temp Unit
      </button>
      <button 
        data-testid="toggle-wind-unit" 
        onClick={() => setWindSpeedUnit(windSpeedUnit === 'kmh' ? 'mph' : 'kmh')}
      >
        Toggle Wind Unit
      </button>
    </div>
  );
};

describe('WeatherContext', () => {
  const mockWeatherData: FormattedWeatherData = {
    location: 'London',
    temperature: 18,
    feelsLike: 17,
    condition: 'Cloudy',
    humidity: 70,
    windSpeed: 12,
    gusts: 18,
    isValid: true,
    time: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  test('provides default context values', async () => {
    render(
      <WeatherProvider>
        <TestComponent />
      </WeatherProvider>
    );

    // Initial state should have no weather data, no loading, no error
    expect(screen.queryByTestId('weather-data')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    
    // Default units should be set
    expect(screen.getByTestId('temp-unit')).toHaveTextContent('C');
    expect(screen.getByTestId('wind-unit')).toHaveTextContent('kmh');
  });

  test('fetches weather by location', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockWeatherData })
    });

    render(
      <WeatherProvider>
        <TestComponent />
      </WeatherProvider>
    );

    // Click the button to fetch weather
    act(() => {
      screen.getByTestId('fetch-by-location').click();
    });

    // Should show loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('weather-data')).toBeInTheDocument();
    });

    // Should display weather data
    expect(screen.getByTestId('location')).toHaveTextContent('London');
    expect(screen.getByTestId('temperature')).toHaveTextContent('18');
    expect(screen.getByTestId('condition')).toHaveTextContent('Cloudy');
    
    // Should have called fetch with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/weather?location=London'),
      expect.any(Object)
    );

    // Should have cached the result
    expect(weatherCache.set).toHaveBeenCalledWith('London', mockWeatherData, expect.any(Number));
  });

  test('fetches weather by coordinates', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockWeatherData })
    });

    render(
      <WeatherProvider>
        <TestComponent />
      </WeatherProvider>
    );

    // Click the button to fetch weather by coordinates
    act(() => {
      screen.getByTestId('fetch-by-coords').click();
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('weather-data')).toBeInTheDocument();
    });

    // Should have called fetch with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/weather?lat=51.5074&lon=-0.1278'),
      expect.any(Object)
    );

    // Should have cached the result
    expect(weatherCache.setByCoords).toHaveBeenCalledWith(
      { lat: 51.5074, lon: -0.1278 },
      mockWeatherData,
      expect.any(Number)
    );
  });

  test('handles API errors', async () => {
    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    render(
      <WeatherProvider>
        <TestComponent />
      </WeatherProvider>
    );

    // Click the button to fetch weather
    act(() => {
      screen.getByTestId('fetch-by-location').click();
    });

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    // Should display error message
    expect(screen.getByTestId('error')).toHaveTextContent('404');
  });

  test('uses cached data when available', async () => {
    // Mock cache hit
    (weatherCache.get as jest.Mock).mockReturnValueOnce(mockWeatherData);

    render(
      <WeatherProvider>
        <TestComponent />
      </WeatherProvider>
    );

    // Click the button to fetch weather
    act(() => {
      screen.getByTestId('fetch-by-location').click();
    });

    // Should immediately show data without loading state
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    
    // Wait for data to appear
    await waitFor(() => {
      expect(screen.getByTestId('weather-data')).toBeInTheDocument();
    });

    // Should not have called fetch
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('toggles temperature unit', async () => {
    render(
      <WeatherProvider>
        <TestComponent />
      </WeatherProvider>
    );

    // Default should be Celsius
    expect(screen.getByTestId('temp-unit')).toHaveTextContent('C');

    // Toggle to Fahrenheit
    act(() => {
      screen.getByTestId('toggle-temp-unit').click();
    });

    // Should now be Fahrenheit
    expect(screen.getByTestId('temp-unit')).toHaveTextContent('F');

    // Toggle back to Celsius
    act(() => {
      screen.getByTestId('toggle-temp-unit').click();
    });

    // Should now be Celsius again
    expect(screen.getByTestId('temp-unit')).toHaveTextContent('C');
  });

  test('toggles wind speed unit', async () => {
    render(
      <WeatherProvider>
        <TestComponent />
      </WeatherProvider>
    );

    // Default should be km/h
    expect(screen.getByTestId('wind-unit')).toHaveTextContent('kmh');

    // Toggle to mph
    act(() => {
      screen.getByTestId('toggle-wind-unit').click();
    });

    // Should now be mph
    expect(screen.getByTestId('wind-unit')).toHaveTextContent('mph');

    // Toggle back to km/h
    act(() => {
      screen.getByTestId('toggle-wind-unit').click();
    });

    // Should now be km/h again
    expect(screen.getByTestId('wind-unit')).toHaveTextContent('kmh');
  });
});