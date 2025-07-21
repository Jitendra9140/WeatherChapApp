import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeatherMessageRenderer, parseWeatherData, cleanContent, extractJsonBlock } from '../components/weather/weather-message-renderer';
import { WeatherProvider } from '../contexts/WeatherContext';

// Mock the WeatherDisplay component
jest.mock('../components/weather/weather-display', () => ({
  WeatherDisplay: ({ data }: any) => (
    <div data-testid="weather-display">
      <div data-testid="weather-location">{data.location}</div>
      <div data-testid="weather-temperature">{data.temperature}</div>
    </div>
  )
}));

describe('WeatherMessageRenderer', () => {
  const userMessage = {
    role: 'user',
    content: 'What is the weather in London?'
  };

  const assistantMessageWithWeatherJson = {
    role: 'assistant',
    content: 'Here is the weather in London:\n\n```json\n{"location":"London","temperature":18,"feelsLike":17,"condition":"Cloudy","humidity":70,"windSpeed":12,"gusts":18}\n```\n\nIt\'s a cloudy day in London.'
  };

  const assistantMessageWithWeatherText = {
    role: 'assistant',
    content: 'The current weather in London is 18°C with cloudy conditions. The humidity is at 70% and the wind is blowing at 12 km/h with gusts up to 18 km/h.'
  };

  const assistantMessageWithoutWeather = {
    role: 'assistant',
    content: 'I don\'t have information about the current weather in London.'
  };

  test('renders user message correctly', () => {
    render(
      <WeatherProvider>
        <WeatherMessageRenderer message={userMessage} />
      </WeatherProvider>
    );

    expect(screen.getByText('What is the weather in London?')).toBeInTheDocument();
    expect(screen.queryByTestId('weather-display')).not.toBeInTheDocument();
  });

  test('renders assistant message with weather JSON correctly', () => {
    render(
      <WeatherProvider>
        <WeatherMessageRenderer message={assistantMessageWithWeatherJson} />
      </WeatherProvider>
    );

    // Should render the message content
    expect(screen.getByText(/Here is the weather in London/)).toBeInTheDocument();
    expect(screen.getByText(/It's a cloudy day in London./)).toBeInTheDocument();
    
    // Should render the WeatherDisplay component
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    expect(screen.getByTestId('weather-location')).toHaveTextContent('London');
    expect(screen.getByTestId('weather-temperature')).toHaveTextContent('18');
  });

  test('renders assistant message with weather text correctly', () => {
    render(
      <WeatherProvider>
        <WeatherMessageRenderer message={assistantMessageWithWeatherText} />
      </WeatherProvider>
    );

    // Should render the message content
    expect(screen.getByText(/The current weather in London is 18°C with cloudy conditions/)).toBeInTheDocument();
    
    // Should render the WeatherDisplay component
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    expect(screen.getByTestId('weather-location')).toHaveTextContent('London');
    expect(screen.getByTestId('weather-temperature')).toHaveTextContent('18');
  });

  test('renders assistant message without weather correctly', () => {
    render(
      <WeatherProvider>
        <WeatherMessageRenderer message={assistantMessageWithoutWeather} />
      </WeatherProvider>
    );

    // Should render the message content
    expect(screen.getByText(/I don't have information about the current weather in London./)).toBeInTheDocument();
    
    // Should not render the WeatherDisplay component
    expect(screen.queryByTestId('weather-display')).not.toBeInTheDocument();
  });
});

describe('parseWeatherData', () => {
  test('parses valid JSON weather data', () => {
    const content = 'Here is the weather:\n\n```json\n{"location":"London","temperature":18,"feelsLike":17,"condition":"Cloudy","humidity":70,"windSpeed":12}\n```';
    
    const result = parseWeatherData(content);
    
    expect(result).toEqual({
      location: 'London',
      temperature: 18,
      feelsLike: 17,
      condition: 'Cloudy',
      humidity: 70,
      windSpeed: 12,
      isValid: true
    });
  });

  test('parses weather data from natural language text', () => {
    const content = 'The current weather in London is 18°C with cloudy conditions. The humidity is at 70% and the wind is blowing at 12 km/h.';
    
    const result = parseWeatherData(content);
    
    expect(result).toEqual({
      location: 'London',
      temperature: 18,
      condition: 'cloudy',
      humidity: 70,
      windSpeed: 12,
      isValid: true
    });
  });

  test('returns null for content without weather data', () => {
    const content = 'I don\'t have information about the current weather.';
    
    const result = parseWeatherData(content);
    
    expect(result).toBeNull();
  });

  test('handles malformed JSON', () => {
    const content = 'Here is the weather:\n\n```json\n{"location":"London","temperature":18,"feelsLike":17,\n```';
    
    const result = parseWeatherData(content);
    
    // Should fall back to text parsing
    expect(result).toEqual({
      location: 'London',
      temperature: 18,
      isValid: true
    });
  });
});

describe('cleanContent', () => {
  test('removes markdown code blocks', () => {
    const content = 'Here is the data:\n\n```json\n{"key":"value"}\n```\n\nMore text.';
    const cleaned = cleanContent(content);
    expect(cleaned).toBe('Here is the data:\n\nMore text.');
  });

  test('handles multiple code blocks', () => {
    const content = '```json\n{"key1":"value1"}\n```\nMiddle text\n```json\n{"key2":"value2"}\n```';
    const cleaned = cleanContent(content);
    expect(cleaned).toBe('Middle text');
  });

  test('handles content without code blocks', () => {
    const content = 'Just plain text with no code blocks.';
    const cleaned = cleanContent(content);
    expect(cleaned).toBe('Just plain text with no code blocks.');
  });

  test('handles empty content', () => {
    const content = '';
    const cleaned = cleanContent(content);
    expect(cleaned).toBe('');
  });
});

describe('extractJsonBlock', () => {
  test('extracts JSON from markdown code block', () => {
    const content = 'Here is the data:\n\n```json\n{"key":"value"}\n```\n\nMore text.';
    const json = extractJsonBlock(content);
    expect(json).toBe('{"key":"value"}');
  });

  test('extracts first JSON block when multiple exist', () => {
    const content = '```json\n{"key1":"value1"}\n```\nMiddle text\n```json\n{"key2":"value2"}\n```';
    const json = extractJsonBlock(content);
    expect(json).toBe('{"key1":"value1"}');
  });

  test('returns null when no JSON block exists', () => {
    const content = 'Just plain text with no code blocks.';
    const json = extractJsonBlock(content);
    expect(json).toBeNull();
  });

  test('handles JSON block without language specifier', () => {
    const content = 'Here is the data:\n\n```\n{"key":"value"}\n```\n\nMore text.';
    const json = extractJsonBlock(content);
    expect(json).toBe('{"key":"value"}');
  });

  test('handles empty content', () => {
    const content = '';
    const json = extractJsonBlock(content);
    expect(json).toBeNull();
  });
});