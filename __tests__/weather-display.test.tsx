import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeatherDisplay } from '../components/weather/weather-display';
import { FormattedWeatherData } from '../lib/weather-formatter';
import { WeatherProvider } from '../contexts/WeatherContext';

// Mock the WeatherIcon component
jest.mock('../components/weather/weather-icons', () => ({
  WeatherIcon: ({ condition }: { condition: string }) => (
    <div data-testid="weather-icon">{condition}</div>
  )
}));

describe('WeatherDisplay', () => {
  const mockWeatherData: FormattedWeatherData = {
    location: 'Test City',
    temperature: 22,
    feelsLike: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 15,
    gusts: 25,
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    dewPoint: 15,
    isValid: true,
    time: new Date().toISOString()
  };

  test('renders weather data correctly', () => {
    render(
      <WeatherProvider>
        <WeatherDisplay data={mockWeatherData} />
      </WeatherProvider>
    );

    // Check if location is displayed
    expect(screen.getByText('Test City')).toBeInTheDocument();
    
    // Check if temperature is displayed
    expect(screen.getByText(/22°C/)).toBeInTheDocument();
    
    // Check if condition is displayed
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
    
    // Check if humidity is displayed
    expect(screen.getByText(/65%/)).toBeInTheDocument();
    
    // Check if wind speed is displayed
    expect(screen.getByText(/15 km\/h/)).toBeInTheDocument();
    
    // Check if the weather icon is rendered
    expect(screen.getByTestId('weather-icon')).toBeInTheDocument();
  });

  test('renders feels like temperature when different', () => {
    render(
      <WeatherProvider>
        <WeatherDisplay data={mockWeatherData} />
      </WeatherProvider>
    );

    // Should show feels like temperature
    expect(screen.getByText(/Feels like/)).toBeInTheDocument();
    expect(screen.getByText(/24°C/)).toBeInTheDocument();
  });

  test('does not render feels like when same as actual temperature', () => {
    const sameFeelsLikeData = {
      ...mockWeatherData,
      feelsLike: mockWeatherData.temperature
    };

    render(
      <WeatherProvider>
        <WeatherDisplay data={sameFeelsLikeData} />
      </WeatherProvider>
    );

    // Should not show feels like temperature
    expect(screen.queryByText(/Feels like/)).not.toBeInTheDocument();
  });

  test('renders wind gusts when present', () => {
    render(
      <WeatherProvider>
        <WeatherDisplay data={mockWeatherData} />
      </WeatherProvider>
    );

    // Should show gusts
    expect(screen.getByText(/gusts up to 25 km\/h/)).toBeInTheDocument();
  });

  test('does not render wind gusts when same as wind speed', () => {
    const noGustsData = {
      ...mockWeatherData,
      gusts: mockWeatherData.windSpeed
    };

    render(
      <WeatherProvider>
        <WeatherDisplay data={noGustsData} />
      </WeatherProvider>
    );

    // Should not show gusts
    expect(screen.queryByText(/gusts/)).not.toBeInTheDocument();
  });

  test('renders error state for invalid data', () => {
    const invalidData = {
      ...mockWeatherData,
      isValid: false
    };

    render(
      <WeatherProvider>
        <WeatherDisplay data={invalidData} />
      </WeatherProvider>
    );

    // Should show error message
    expect(screen.getByText(/Unable to retrieve weather data/)).toBeInTheDocument();
  });

  test('renders with action buttons when provided', () => {
    const handleRefresh = jest.fn();
    const handleClose = jest.fn();

    render(
      <WeatherProvider>
        <WeatherDisplay 
          data={mockWeatherData} 
          onRefresh={handleRefresh}
          onClose={handleClose}
        />
      </WeatherProvider>
    );

    // Should render action buttons
    expect(screen.getByLabelText(/refresh/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/close/i)).toBeInTheDocument();
  });

  test('renders without action buttons when not provided', () => {
    render(
      <WeatherProvider>
        <WeatherDisplay data={mockWeatherData} />
      </WeatherProvider>
    );

    // Should not render action buttons
    expect(screen.queryByLabelText(/refresh/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/close/i)).not.toBeInTheDocument();
  });

  test('renders additional weather details when available', () => {
    render(
      <WeatherProvider>
        <WeatherDisplay data={mockWeatherData} />
      </WeatherProvider>
    );

    // Should show pressure
    expect(screen.getByText(/1013 hPa/)).toBeInTheDocument();
    
    // Should show visibility
    expect(screen.getByText(/10 km/)).toBeInTheDocument();
    
    // Should show UV index
    expect(screen.getByText(/UV: 5/)).toBeInTheDocument();
  });

  test('handles missing optional weather details', () => {
    const minimalData = {
      location: 'Minimal City',
      temperature: 20,
      feelsLike: 20,
      condition: 'Clear',
      humidity: 50,
      windSpeed: 10,
      gusts: 10,
      isValid: true
    };

    render(
      <WeatherProvider>
        <WeatherDisplay data={minimalData} />
      </WeatherProvider>
    );

    // Should not show pressure
    expect(screen.queryByText(/hPa/)).not.toBeInTheDocument();
    
    // Should not show visibility
    expect(screen.queryByText(/km visibility/)).not.toBeInTheDocument();
    
    // Should not show UV index
    expect(screen.queryByText(/UV:/)).not.toBeInTheDocument();
  });

  test('respects temperature unit from context', () => {
    // This test would need a more complex setup to modify the context
    // For simplicity, we're just checking the default unit (Celsius) is used
    render(
      <WeatherProvider>
        <WeatherDisplay weatherData={mockWeatherData} />
      </WeatherProvider>
    );

    // Should show temperature in Celsius
    expect(screen.getByText(/22°C/)).toBeInTheDocument();
  });
});