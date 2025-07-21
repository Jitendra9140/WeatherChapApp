"use client"

import React from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  CloudHail,
  Wind,
  CloudSun,
  Snowflake,
} from 'lucide-react';

interface WeatherIconProps {
  condition?: string;
  size?: number;
  color?: string;
  className?: string;
}

// Helper function to find the matching icon based on weather condition
export const findMatchingIcon = (condition?: string) => {
  const lowerCondition = typeof condition === 'string' ? condition.toLowerCase() : '';
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  // Clear/Sunny conditions
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return { icon: Sun, color: isDarkMode ? '#fbbf24' : '#f59e0b' }; // Amber-400 for dark, Amber-500 for light
  }

  // Partly cloudy conditions
  if (lowerCondition.includes('partly cloudy') || lowerCondition.includes('partly sunny')) {
    return { icon: CloudSun, color: isDarkMode ? '#9ca3af' : '#6b7280' }; // Gray-400 for dark, Gray-500 for light
  }

  // Cloudy conditions
  if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
    return { icon: Cloud, color: isDarkMode ? '#9ca3af' : '#6b7280' }; // Gray-400 for dark, Gray-500 for light
  }

  // Foggy conditions
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist') || lowerCondition.includes('haze')) {
    return { icon: CloudFog, color: isDarkMode ? '#d1d5db' : '#9ca3af' }; // Gray-300 for dark, Gray-400 for light
  }

  // Drizzle conditions
  if (lowerCondition.includes('drizzle')) {
    return { icon: CloudDrizzle, color: isDarkMode ? '#93c5fd' : '#60a5fa' }; // Blue-300 for dark, Blue-400 for light
  }

  // Rain conditions
  if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
    return { icon: CloudRain, color: isDarkMode ? '#60a5fa' : '#3b82f6' }; // Blue-400 for dark, Blue-500 for light
  }

  // Thunderstorm conditions
  if (lowerCondition.includes('thunder') || lowerCondition.includes('storm') || lowerCondition.includes('lightning')) {
    return { icon: CloudLightning, color: isDarkMode ? '#a78bfa' : '#8b5cf6' }; // Violet-400 for dark, Violet-500 for light
  }

  // Hail conditions
  if (lowerCondition.includes('hail') || lowerCondition.includes('ice pellets')) {
    return { icon: CloudHail, color: isDarkMode ? '#bfdbfe' : '#93c5fd' }; // Blue-200 for dark, Blue-300 for light
  }

  // Snow conditions
  if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard') || lowerCondition.includes('flurries')) {
    return { icon: CloudSnow, color: isDarkMode ? '#f9fafb' : '#e5e7eb' }; // Gray-50 for dark, Gray-200 for light
  }

  // Sleet or freezing rain
  if (lowerCondition.includes('sleet') || lowerCondition.includes('freezing rain')) {
    return { icon: Snowflake, color: isDarkMode ? '#bfdbfe' : '#93c5fd' }; // Blue-200 for dark, Blue-300 for light
  }

  // Windy conditions
  if (lowerCondition.includes('wind') || lowerCondition.includes('breezy') || lowerCondition.includes('gust')) {
    return { icon: Wind, color: isDarkMode ? '#9ca3af' : '#6b7280' }; // Gray-400 for dark, Gray-500 for light
  }

  // Default to sunny if no match
  return { icon: Sun, color: isDarkMode ? '#fbbf24' : '#f59e0b' }; // Amber-400 for dark, Amber-500 for light
};

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  size = 24,
  color,
  className = ''
}) => {
  if (!condition) {
    console.warn("WeatherIcon: 'condition' prop is undefined.");
  }

  // Use React.useState and useEffect to handle theme changes
  const [iconColor, setIconColor] = React.useState('');
  
  React.useEffect(() => {
    // Get the initial color
    const { color: defaultColor } = findMatchingIcon(condition);
    setIconColor(color || defaultColor);
    
    // Set up a MutationObserver to watch for theme changes
    const observer = new MutationObserver(() => {
      const { color: newColor } = findMatchingIcon(condition);
      setIconColor(color || newColor);
    });
    
    // Watch for class changes on the html element (dark mode toggle)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Clean up
    return () => observer.disconnect();
  }, [condition, color]);
  
  const { icon: IconComponent } = findMatchingIcon(condition);

  return (
    <IconComponent
      size={size}
      color={iconColor}
      className={`${className} transition-colors duration-200`}
    />
  );
};

export default WeatherIcon;
