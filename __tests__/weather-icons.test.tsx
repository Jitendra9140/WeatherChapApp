import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeatherIcon, findMatchingIcon } from '../components/weather/weather-icons';
import * as LucideIcons from 'lucide-react';

// Mock the lucide-react icons
jest.mock('lucide-react', () => {
  const originalModule = jest.requireActual('lucide-react');
  
  // Create mock components for all the icons we use
  const mockIcons = Object.keys(originalModule).reduce((acc, key) => {
    if (typeof originalModule[key] === 'function' && key !== 'createReactComponent') {
      acc[key] = ({ size, color }: { size?: number; color?: string }) => (
        <div data-testid={`icon-${key}`} data-size={size} data-color={color}>{key}</div>
      );
    } else {
      acc[key] = originalModule[key];
    }
    return acc;
  }, {} as typeof LucideIcons);
  
  return mockIcons;
});

describe('WeatherIcon', () => {
  test('renders the correct icon for sunny condition', () => {
    render(<WeatherIcon condition="sunny" />);
    expect(screen.getByTestId('icon-Sun')).toBeInTheDocument();
  });

  test('renders the correct icon for clear condition', () => {
    render(<WeatherIcon condition="clear" />);
    expect(screen.getByTestId('icon-Sun')).toBeInTheDocument();
  });

  test('renders the correct icon for partly cloudy condition', () => {
    render(<WeatherIcon condition="partly cloudy" />);
    expect(screen.getByTestId('icon-Cloud')).toBeInTheDocument();
  });

  test('renders the correct icon for cloudy condition', () => {
    render(<WeatherIcon condition="cloudy" />);
    expect(screen.getByTestId('icon-Cloud')).toBeInTheDocument();
  });

  test('renders the correct icon for overcast condition', () => {
    render(<WeatherIcon condition="overcast" />);
    expect(screen.getByTestId('icon-CloudFog')).toBeInTheDocument();
  });

  test('renders the correct icon for rain condition', () => {
    render(<WeatherIcon condition="rain" />);
    expect(screen.getByTestId('icon-CloudRain')).toBeInTheDocument();
  });

  test('renders the correct icon for heavy rain condition', () => {
    render(<WeatherIcon condition="heavy rain" />);
    expect(screen.getByTestId('icon-CloudDrizzle')).toBeInTheDocument();
  });

  test('renders the correct icon for thunderstorm condition', () => {
    render(<WeatherIcon condition="thunderstorm" />);
    expect(screen.getByTestId('icon-CloudLightning')).toBeInTheDocument();
  });

  test('renders the correct icon for snow condition', () => {
    render(<WeatherIcon condition="snow" />);
    expect(screen.getByTestId('icon-CloudSnow')).toBeInTheDocument();
  });

  test('renders the correct icon for mist condition', () => {
    render(<WeatherIcon condition="mist" />);
    expect(screen.getByTestId('icon-CloudFog')).toBeInTheDocument();
  });

  test('renders the correct icon for fog condition', () => {
    render(<WeatherIcon condition="fog" />);
    expect(screen.getByTestId('icon-CloudFog')).toBeInTheDocument();
  });

  test('renders the correct icon for haze condition', () => {
    render(<WeatherIcon condition="haze" />);
    expect(screen.getByTestId('icon-CloudFog')).toBeInTheDocument();
  });

  test('renders the correct icon for windy condition', () => {
    render(<WeatherIcon condition="windy" />);
    expect(screen.getByTestId('icon-Wind')).toBeInTheDocument();
  });

  test('renders the default icon for unknown condition', () => {
    render(<WeatherIcon condition="unknown condition" />);
    expect(screen.getByTestId('icon-Cloud')).toBeInTheDocument();
  });

  test('applies custom size when provided', () => {
    render(<WeatherIcon condition="sunny" size={48} />);
    expect(screen.getByTestId('icon-Sun')).toHaveAttribute('data-size', '48');
  });

  test('applies custom color when provided', () => {
    render(<WeatherIcon condition="sunny" color="#FF0000" />);
    expect(screen.getByTestId('icon-Sun')).toHaveAttribute('data-color', '#FF0000');
  });

  test('applies default size when not provided', () => {
    render(<WeatherIcon condition="sunny" />);
    expect(screen.getByTestId('icon-Sun')).toHaveAttribute('data-size', '24');
  });

  test('applies default color when not provided', () => {
    render(<WeatherIcon condition="sunny" />);
    expect(screen.getByTestId('icon-Sun')).toHaveAttribute('data-color', 'currentColor');
  });
});

describe('findMatchingIcon', () => {
  test('matches sunny condition', () => {
    expect(findMatchingIcon('sunny')).toBe('Sun');
    expect(findMatchingIcon('clear sky')).toBe('Sun');
    expect(findMatchingIcon('clear')).toBe('Sun');
  });

  test('matches cloudy condition', () => {
    expect(findMatchingIcon('cloudy')).toBe('Cloud');
    expect(findMatchingIcon('partly cloudy')).toBe('Cloud');
    expect(findMatchingIcon('scattered clouds')).toBe('Cloud');
    expect(findMatchingIcon('broken clouds')).toBe('Cloud');
  });

  test('matches overcast condition', () => {
    expect(findMatchingIcon('overcast')).toBe('CloudFog');
    expect(findMatchingIcon('overcast clouds')).toBe('CloudFog');
  });

  test('matches rain condition', () => {
    expect(findMatchingIcon('rain')).toBe('CloudRain');
    expect(findMatchingIcon('light rain')).toBe('CloudRain');
    expect(findMatchingIcon('moderate rain')).toBe('CloudRain');
    expect(findMatchingIcon('drizzle')).toBe('CloudRain');
    expect(findMatchingIcon('light intensity drizzle')).toBe('CloudRain');
  });

  test('matches heavy rain condition', () => {
    expect(findMatchingIcon('heavy rain')).toBe('CloudDrizzle');
    expect(findMatchingIcon('heavy intensity rain')).toBe('CloudDrizzle');
    expect(findMatchingIcon('very heavy rain')).toBe('CloudDrizzle');
    expect(findMatchingIcon('extreme rain')).toBe('CloudDrizzle');
  });

  test('matches thunderstorm condition', () => {
    expect(findMatchingIcon('thunderstorm')).toBe('CloudLightning');
    expect(findMatchingIcon('thunder')).toBe('CloudLightning');
    expect(findMatchingIcon('lightning')).toBe('CloudLightning');
    expect(findMatchingIcon('thunderstorm with rain')).toBe('CloudLightning');
  });

  test('matches snow condition', () => {
    expect(findMatchingIcon('snow')).toBe('CloudSnow');
    expect(findMatchingIcon('light snow')).toBe('CloudSnow');
    expect(findMatchingIcon('heavy snow')).toBe('CloudSnow');
    expect(findMatchingIcon('sleet')).toBe('CloudSnow');
  });

  test('matches fog/mist condition', () => {
    expect(findMatchingIcon('fog')).toBe('CloudFog');
    expect(findMatchingIcon('mist')).toBe('CloudFog');
    expect(findMatchingIcon('haze')).toBe('CloudFog');
    expect(findMatchingIcon('smoke')).toBe('CloudFog');
  });

  test('matches windy condition', () => {
    expect(findMatchingIcon('windy')).toBe('Wind');
    expect(findMatchingIcon('strong winds')).toBe('Wind');
    expect(findMatchingIcon('breezy')).toBe('Wind');
  });

  test('returns default for unknown condition', () => {
    expect(findMatchingIcon('unknown')).toBe('Cloud');
    expect(findMatchingIcon('')).toBe('Cloud');
  });

  test('is case insensitive', () => {
    expect(findMatchingIcon('SUNNY')).toBe('Sun');
    expect(findMatchingIcon('Partly Cloudy')).toBe('Cloud');
    expect(findMatchingIcon('THUNDERSTORM')).toBe('CloudLightning');
  });
});