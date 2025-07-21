import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeatherSample } from '../components/weather/weather-sample';
import { WeatherProvider } from '../contexts/WeatherContext';

// Mock the WeatherDisplay component
jest.mock('../components/weather/weather-display', () => ({
  WeatherDisplay: ({ data }: any) => (
    <div data-testid="weather-display">
      <div data-testid="weather-location">{data.location}</div>
      <div data-testid="weather-temperature">{data.temperature}</div>
      <div data-testid="weather-condition">{data.condition}</div>
    </div>
  )
}));

// Mock the useWeather hook
jest.mock('../contexts/WeatherContext', () => {
  const originalModule = jest.requireActual('../contexts/WeatherContext');
  
  return {
    ...originalModule,
    useWeather: () => ({
      fetchWeatherByLocation: jest.fn(),
      fetchWeatherByCoordinates: jest.fn(),
      setTemperatureUnit: jest.fn(),
      setWindSpeedUnit: jest.fn(),
      temperatureUnit: 'C',
      windSpeedUnit: 'kmh',
      loading: false,
      error: null
    })
  };
});

describe('WeatherSample', () => {
  test('renders the component with default preset location', () => {
    render(
      <WeatherProvider>
        <WeatherSample />
      </WeatherProvider>
    );

    // Should render the component title
    expect(screen.getByText('Weather Display Sample')).toBeInTheDocument();
    
    // Should render preset location options
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Sydney')).toBeInTheDocument();
    
    // Should render unit toggle options
    expect(screen.getByText('°C')).toBeInTheDocument();
    expect(screen.getByText('°F')).toBeInTheDocument();
    expect(screen.getByText('km/h')).toBeInTheDocument();
    expect(screen.getByText('mph')).toBeInTheDocument();
    
    // Should render the WeatherDisplay component with default data
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    expect(screen.getByTestId('weather-location')).toHaveTextContent('New York');
  });

  test('allows selecting a preset location', () => {
    render(
      <WeatherProvider>
        <WeatherSample />
      </WeatherProvider>
    );

    // Click on London preset
    fireEvent.click(screen.getByText('London'));
    
    // Should update the WeatherDisplay with London data
    expect(screen.getByTestId('weather-location')).toHaveTextContent('London');
  });

  test('allows entering a custom location', () => {
    render(
      <WeatherProvider>
        <WeatherSample />
      </WeatherProvider>
    );

    // Find the input field
    const input = screen.getByPlaceholderText('Enter location...');
    
    // Enter a custom location
    fireEvent.change(input, { target: { value: 'Paris' } });
    
    // Click the search button
    fireEvent.click(screen.getByLabelText('Search'));
    
    // Should update the WeatherDisplay with Paris data
    expect(screen.getByTestId('weather-location')).toHaveTextContent('Paris');
  });

  test('toggles temperature unit', () => {
    render(
      <WeatherProvider>
        <WeatherSample />
      </WeatherProvider>
    );

    // Default should be Celsius (°C button should be active)
    expect(screen.getByText('°C').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('°F').closest('button')).toHaveAttribute('aria-pressed', 'false');
    
    // Click on Fahrenheit
    fireEvent.click(screen.getByText('°F'));
    
    // Now Fahrenheit should be active
    expect(screen.getByText('°C').closest('button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('°F').closest('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('toggles wind speed unit', () => {
    render(
      <WeatherProvider>
        <WeatherSample />
      </WeatherProvider>
    );

    // Default should be km/h (km/h button should be active)
    expect(screen.getByText('km/h').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('mph').closest('button')).toHaveAttribute('aria-pressed', 'false');
    
    // Click on mph
    fireEvent.click(screen.getByText('mph'));
    
    // Now mph should be active
    expect(screen.getByText('km/h').closest('button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('mph').closest('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('displays sample weather data for each preset location', () => {
    render(
      <WeatherProvider>
        <WeatherSample />
      </WeatherProvider>
    );

    // Check New York (default)
    expect(screen.getByTestId('weather-location')).toHaveTextContent('New York');
    
    // Click on London
    fireEvent.click(screen.getByText('London'));
    expect(screen.getByTestId('weather-location')).toHaveTextContent('London');
    
    // Click on Tokyo
    fireEvent.click(screen.getByText('Tokyo'));
    expect(screen.getByTestId('weather-location')).toHaveTextContent('Tokyo');
    
    // Click on Sydney
    fireEvent.click(screen.getByText('Sydney'));
    expect(screen.getByTestId('weather-location')).toHaveTextContent('Sydney');
  });
});