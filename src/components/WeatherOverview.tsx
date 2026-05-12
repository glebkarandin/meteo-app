import { getWeatherMeta, toRoundedValue } from "../functions"
import type { WeatherOverviewProps } from "../type"

export const WeatherOverview = ({ weather }: WeatherOverviewProps) => {
    const meta = getWeatherMeta(weather.current.weatherCode)
  
    return (
      <section className="panel weather-overview">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Текущая погода</p>
            <h2>{weather.cityLabel}</h2>
          </div>
          <p className="timezone">Часовой пояс: {weather.timezone}</p>
        </div>
  
        <div className="weather-main">
          <div className="weather-summary">
            <span className="weather-icon" aria-hidden="true">
              {meta.icon}
            </span>
            <div>
              <div className="temperature">
                {toRoundedValue(weather.current.temperature)}°C
              </div>
              <p>{meta.label}</p>
            </div>
          </div>
  
          <dl className="metrics-grid">
            <div>
              <dt>Ощущается как</dt>
              <dd>{toRoundedValue(weather.current.apparentTemperature)}°C</dd>
            </div>
            <div>
              <dt>Влажность</dt>
              <dd>{toRoundedValue(weather.current.humidity)}%</dd>
            </div>
            <div>
              <dt>Ветер</dt>
              <dd>{toRoundedValue(weather.current.windSpeed)} км/ч</dd>
            </div>
          </dl>
        </div>
      </section>
    )
  }
