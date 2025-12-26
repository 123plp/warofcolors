import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, Wind, Droplets, Thermometer } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  widget: Widget;
}

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';

interface WeatherData {
  condition: WeatherCondition;
  temp: number;
  humidity: number;
  wind: number;
  location: string;
  forecast: { day: string; condition: WeatherCondition; high: number; low: number }[];
}

const WEATHER_ICONS: Record<WeatherCondition, typeof Sun> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
  snowy: CloudSnow,
};

const WEATHER_COLORS: Record<WeatherCondition, string> = {
  sunny: 'text-yellow-400',
  cloudy: 'text-slate-400',
  rainy: 'text-blue-400',
  stormy: 'text-purple-400',
  snowy: 'text-cyan-200',
};

// Simulated weather data
const generateWeather = (): WeatherData => {
  const conditions: WeatherCondition[] = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  return {
    condition: conditions[Math.floor(Math.random() * 3)],
    temp: Math.floor(Math.random() * 30) + 10,
    humidity: Math.floor(Math.random() * 40) + 40,
    wind: Math.floor(Math.random() * 20) + 5,
    location: 'Site-19',
    forecast: days.map(day => ({
      day,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      high: Math.floor(Math.random() * 15) + 20,
      low: Math.floor(Math.random() * 10) + 5,
    })),
  };
};

export const WeatherWidget = ({ widget }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData>(() => generateWeather());

  useEffect(() => {
    // Update weather every 5 minutes
    const interval = setInterval(() => {
      setWeather(generateWeather());
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const WeatherIcon = WEATHER_ICONS[weather.condition];
  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  return (
    <div className="w-full h-full p-3 flex flex-col">
      {/* Main weather display */}
      <div className="flex items-center gap-3">
        <WeatherIcon className={cn(
          WEATHER_COLORS[weather.condition],
          isSmall ? "w-10 h-10" : "w-14 h-14"
        )} />
        <div>
          <div className={cn(
            "font-bold text-foreground",
            isSmall ? "text-2xl" : "text-3xl"
          )}>
            {weather.temp}°C
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {weather.condition}
          </div>
        </div>
        {!isSmall && (
          <div className="ml-auto text-right">
            <div className="text-sm font-medium">{weather.location}</div>
            <div className="text-xs text-muted-foreground">
              Outdoor Conditions
            </div>
          </div>
        )}
      </div>

      {/* Additional info */}
      {!isSmall && (
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            {weather.humidity}%
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            {weather.wind} km/h
          </div>
        </div>
      )}

      {/* Forecast */}
      {isLarge && (
        <div className="mt-auto pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground mb-2">5-Day Forecast</div>
          <div className="flex justify-between">
            {weather.forecast.map((day, i) => {
              const DayIcon = WEATHER_ICONS[day.condition];
              return (
                <div key={i} className="text-center">
                  <div className="text-xs text-muted-foreground">{day.day}</div>
                  <DayIcon className={cn("w-5 h-5 mx-auto my-1", WEATHER_COLORS[day.condition])} />
                  <div className="text-xs">
                    <span className="text-foreground">{day.high}°</span>
                    <span className="text-muted-foreground"> {day.low}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
