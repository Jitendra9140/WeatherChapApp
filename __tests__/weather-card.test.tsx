import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeatherCard, getWeatherIcon, getSmallWeatherIcon } from '../components/weather/weather-card';
import { FormattedWeatherData } from '../lib/weather-formatter';
import { WeatherProvider } from '../contexts/WeatherContext';

// Mock the lucide-react icons
jest.mock('lucide-react', () => {
  const originalModule = jest.requireActual('lucide-react');
  
  // Create mock components for all the icons we use
  const mockIcons = {};
  
  // Add all icon components as mocks
  Object.keys(originalModule).forEach(key => {
    if (typeof originalModule[key] === 'function' && key !== 'createReactComponent') {
      mockIcons[key] = ({ size, color }: { size?: number; color?: string }) => (
        <div data-testid={`icon-${key}`} data-size={size} data-color={color}>{key}</div>
      );
    } else {
      mockIcons[key] = originalModule[key];
    }
  });
  
  return mockIcons;
});

// Mock the shadcn components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="card-footer">{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <div data-testid="badge">{children}</div>,
}));

describe('WeatherCard', () => {
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
    time: new Date().toISOString(),
    sunrise: '06:30',
    sunset: '20:15',
    forecast: [
      { day: 'Mon', condition: 'Sunny', high: 25, low: 18 },
      { day: 'Tue', condition: 'Cloudy', high: 22, low: 17 },
      { day: 'Wed', condition: 'Rain', high: 20, low: 15 }
    ]
  };

  test('renders weather card with all data', () => {
    render(
      <WeatherProvider>
        <WeatherCard weatherData={mockWeatherData} />
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
    
    // Check if pressure is displayed
    expect(screen.getByText(/1013 hPa/)).toBeInTheDocument();
    
    // Check if visibility is displayed
    expect(screen.getByText(/10 km/)).toBeInTheDocument();
    
    // Check if UV index is displayed
    expect(screen.getByText(/UV 5/)).toBeInTheDocument();
    
    // Check if sunrise/sunset is displayed
    expect(screen.getByText(/06:30/)).toBeInTheDocument();
    expect(screen.getByText(/20:15/)).toBeInTheDocument();
    
    // Check if forecast is displayed
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
  });

  test('renders with minimal data', () => {
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
        <WeatherCard weatherData={minimalData} />
      </WeatherProvider>
    );

    // Check if basic data is displayed
    expect(screen.getByText('Minimal City')).toBeInTheDocument();
    expect(screen.getByText(/20°C/)).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    
    // Optional data should not be present
    expect(screen.queryByText(/hPa/)).not.toBeInTheDocument();
    expect(screen.queryByText(/UV/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mon/)).not.toBeInTheDocument(); // No forecast
  });
});

describe('getWeatherIcon', () => {
  test('returns Sun icon for sunny condition', () => {
    expect(getWeatherIcon('sunny')).toBe('Sun');
    expect(getWeatherIcon('clear')).toBe('Sun');
    expect(getWeatherIcon('clear sky')).toBe('Sun');
  });

  test('returns Cloud icon for cloudy condition', () => {
    expect(getWeatherIcon('cloudy')).toBe('Cloud');
    expect(getWeatherIcon('partly cloudy')).toBe('Cloud');
    expect(getWeatherIcon('scattered clouds')).toBe('Cloud');
  });

  test('returns CloudRain icon for rain condition', () => {
    expect(getWeatherIcon('rain')).toBe('CloudRain');
    expect(getWeatherIcon('light rain')).toBe('CloudRain');
    expect(getWeatherIcon('drizzle')).toBe('CloudRain');
  });

  test('returns CloudLightning icon for thunderstorm condition', () => {
    expect(getWeatherIcon('thunderstorm')).toBe('CloudLightning');
    expect(getWeatherIcon('thunder')).toBe('CloudLightning');
  });

  test('returns CloudSnow icon for snow condition', () => {
    expect(getWeatherIcon('snow')).toBe('CloudSnow');
    expect(getWeatherIcon('light snow')).toBe('CloudSnow');
  });

  test('returns CloudFog icon for fog/mist condition', () => {
    expect(getWeatherIcon('fog')).toBe('CloudFog');
    expect(getWeatherIcon('mist')).toBe('CloudFog');
    expect(getWeatherIcon('haze')).toBe('CloudFog');
  });

  test('returns Wind icon for windy condition', () => {
    expect(getWeatherIcon('windy')).toBe('Wind');
    expect(getWeatherIcon('strong winds')).toBe('Wind');
  });

  test('returns Cloud as default for unknown condition', () => {
    expect(getWeatherIcon('unknown')).toBe('Cloud');
    expect(getWeatherIcon('')).toBe('Cloud');
  });
});

describe('getSmallWeatherIcon', () => {
  test('returns Sun icon for sunny condition', () => {
    expect(getSmallWeatherIcon('sunny')).toBe('Sun');
    expect(getSmallWeatherIcon('clear')).toBe('Sun');
  });

  test('returns Cloud icon for cloudy condition', () => {
    expect(getSmallWeatherIcon('cloudy')).toBe('Cloud');
    expect(getSmallWeatherIcon('partly cloudy')).toBe('Cloud');
  });

  test('returns CloudRain icon for rain condition', () => {
    expect(getSmallWeatherIcon('rain')).toBe('CloudRain');
    expect(getSmallWeatherIcon('light rain')).toBe('CloudRain');
  });

  test('returns CloudLightning icon for thunderstorm condition', () => {
    expect(getSmallWeatherIcon('thunderstorm')).toBe('CloudLightning');
  });

  test('returns CloudSnow icon for snow condition', () => {
    expect(getSmallWeatherIcon('snow')).toBe('CloudSnow');
  });

  test('returns Cloud as default for unknown condition', () => {
    expect(getSmallWeatherIcon('unknown')).toBe('Cloud');
    expect(getSmallWeatherIcon('')).toBe('Cloud');
  });
});