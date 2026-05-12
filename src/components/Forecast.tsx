import type { ForecastProps } from "../type"

import {getWeatherMeta, formatWeekday, toRoundedValue} from "../functions"

export const Forecast = ({ weather }: ForecastProps) => {
    return (
      <section className="panel">
        <div className="panel-header">
          <h2>Прогноз на 5 дней</h2>
          <p>
            Этот блок получает данные через props. Так React связывает родительский
            компонент и дочерний без дублирования state.
          </p>
        </div>
  
        <div className="forecast-grid">
          {weather.daily.map((day) => {
            const meta = getWeatherMeta(day.weatherCode)
  
            return (
              <article key={day.date} className="forecast-card">
                <p className="forecast-day">
                  {formatWeekday(day.date, weather.timezone)}
                </p>
                <div className="forecast-icon" aria-hidden="true">
                  {meta.icon}
                </div>
                <strong>{meta.label}</strong>
                <p>
                  {toRoundedValue(day.tempMax)}° / {toRoundedValue(day.tempMin)}°
                </p>
                <p>Осадки: {toRoundedValue(day.precipitationProbability)}%</p>
              </article>
            )
          })}
        </div>
      </section>
    )
  }
