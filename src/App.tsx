import { useEffect, useState } from 'react'
import './App.css'

type SearchResult = {
  id: number
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
  timezone: string
}

type WeatherSnapshot = {
  cityLabel: string
  timezone: string
  current: {
    temperature: number
    apparentTemperature: number
    humidity: number
    windSpeed: number
    weatherCode: number
  }
  daily: Array<{
    date: string
    weatherCode: number
    tempMax: number
    tempMin: number
    precipitationProbability: number
  }>
}

type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

const DEFAULT_CITY = 'Moscow'

const weatherCodeMap: Record<number, { label: string; icon: string }> = {
  0: { label: 'Ясно', icon: '☀️' },
  1: { label: 'Преимущественно ясно', icon: '🌤️' },
  2: { label: 'Переменная облачность', icon: '⛅' },
  3: { label: 'Пасмурно', icon: '☁️' },
  45: { label: 'Туман', icon: '🌫️' },
  48: { label: 'Изморозь', icon: '🌫️' },
  51: { label: 'Слабая морось', icon: '🌦️' },
  53: { label: 'Морось', icon: '🌦️' },
  55: { label: 'Сильная морось', icon: '🌧️' },
  61: { label: 'Небольшой дождь', icon: '🌦️' },
  63: { label: 'Дождь', icon: '🌧️' },
  65: { label: 'Сильный дождь', icon: '⛈️' },
  71: { label: 'Небольшой снег', icon: '🌨️' },
  73: { label: 'Снег', icon: '❄️' },
  75: { label: 'Сильный снег', icon: '❄️' },
  80: { label: 'Ливень', icon: '🌧️' },
  81: { label: 'Сильный ливень', icon: '⛈️' },
  82: { label: 'Очень сильный ливень', icon: '⛈️' },
  95: { label: 'Гроза', icon: '⛈️' },
}

function getWeatherMeta(code: number) {
  return weatherCodeMap[code] ?? { label: 'Неизвестная погода', icon: '🌍' }
}

function formatCityLabel(city: SearchResult) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ')
}

function formatWeekday(date: string, timezone: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: timezone,
  }).format(new Date(date))
}

function toRoundedValue(value: number) {
  return Math.round(value)
}

type SearchFormProps = {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

function SearchForm({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
}: SearchFormProps) {
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      {/* Управляемое поле показывает базовую идею React:
          значение живет в state, а input только отображает его. */}
      <label className="search-label" htmlFor="city-search">
        Введите город
      </label>
      <div className="search-row">
        <input
          id="city-search"
          className="search-input"
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Например, Moscow, Kazan или Berlin"
        />
        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Ищем...' : 'Показать погоду'}
        </button>
      </div>
    </form>
  )
}

type CityListProps = {
  cities: SearchResult[]
  selectedCityId: number | null
  onSelect: (city: SearchResult) => void
}

function CityList({ cities, selectedCityId, onSelect }: CityListProps) {
  if (cities.length === 0) {
    return null
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Найденные города</h2>
        <p>Здесь видно работу с массивами и рендерингом списков через `map`.</p>
      </div>

      <div className="city-list">
        {cities.map((city) => {
          const isSelected = city.id === selectedCityId

          return (
            <button
              key={city.id}
              type="button"
              className={`city-card ${isSelected ? 'city-card--active' : ''}`}
              onClick={() => onSelect(city)}
            >
              <strong>{city.name}</strong>
              <span>{[city.admin1, city.country].filter(Boolean).join(', ')}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

type WeatherOverviewProps = {
  weather: WeatherSnapshot
}

function WeatherOverview({ weather }: WeatherOverviewProps) {
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

type ForecastProps = {
  weather: WeatherSnapshot
}

function Forecast({ weather }: ForecastProps) {
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

function App() {
  // useState нужен, когда React-компонент должен "помнить" данные между рендерами.
  const [query, setQuery] = useState(DEFAULT_CITY)
  const [cities, setCities] = useState<SearchResult[]>([])
  const [selectedCity, setSelectedCity] = useState<SearchResult | null>(null)
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null)
  const [searchStatus, setSearchStatus] = useState<ApiStatus>('idle')
  const [weatherStatus, setWeatherStatus] = useState<ApiStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function loadCities(cityName: string) {
    const trimmedQuery = cityName.trim()

    if (!trimmedQuery) {
      setErrorMessage('Введите название города, чтобы выполнить поиск.')
      setCities([])
      setSelectedCity(null)
      setWeather(null)
      return
    }

    setSearchStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedQuery)}&count=5&language=ru&format=json`,
      )

      if (!response.ok) {
        throw new Error('Не удалось получить список городов.')
      }

      const data = (await response.json()) as { results?: SearchResult[] }
      const nextCities = data.results ?? []

      if (nextCities.length === 0) {
        setCities([])
        setSelectedCity(null)
        setWeather(null)
        setSearchStatus('error')
        setErrorMessage('По этому запросу города не найдены.')
        return
      }

      setCities(nextCities)
      setSelectedCity(nextCities[0])
      setSearchStatus('success')
    } catch {
      setCities([])
      setSelectedCity(null)
      setWeather(null)
      setSearchStatus('error')
      setErrorMessage(
        'Ошибка поиска. Проверьте подключение к сети и попробуйте снова.',
      )
    }
  }

  useEffect(() => {
    // Небольшая отложенная инициализация позволяет показать стартовую загрузку
    // и при этом не нарушать правило линтера о синхронном setState в эффекте.
    const timerId = window.setTimeout(() => {
      void loadCities(DEFAULT_CITY)
    }, 0)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [])

  useEffect(() => {
    if (!selectedCity) {
      return
    }

    const city = selectedCity

    // useEffect нужен для побочных эффектов: запросы к API нельзя делать прямо в JSX.
    // React запускает эффект после рендера, когда state уже синхронизирован с интерфейсом.
    const abortController = new AbortController()

    async function loadWeather() {
      setWeatherStatus('loading')
      setErrorMessage('')

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=${encodeURIComponent(city.timezone)}`,
          { signal: abortController.signal },
        )

        if (!response.ok) {
          throw new Error('Не удалось загрузить погоду.')
        }

        const data = (await response.json()) as {
          current: {
            temperature_2m: number
            apparent_temperature: number
            relative_humidity_2m: number
            weather_code: number
            wind_speed_10m: number
          }
          daily: {
            time: string[]
            weather_code: number[]
            temperature_2m_max: number[]
            temperature_2m_min: number[]
            precipitation_probability_max: number[]
          }
        }

        setWeather({
          cityLabel: formatCityLabel(city),
          timezone: city.timezone,
          current: {
            temperature: data.current.temperature_2m,
            apparentTemperature: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            weatherCode: data.current.weather_code,
          },
          daily: data.daily.time.map((date, index) => ({
            date,
            weatherCode: data.daily.weather_code[index],
            tempMax: data.daily.temperature_2m_max[index],
            tempMin: data.daily.temperature_2m_min[index],
            precipitationProbability:
              data.daily.precipitation_probability_max[index],
          })),
        })
        setWeatherStatus('success')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setWeather(null)
        setWeatherStatus('error')
        setErrorMessage(
          'Погоду получить не удалось. Возможно, API временно недоступно.',
        )
      }
    }

    void loadWeather()

    // Функция очистки показывает еще одну важную идею React:
    // когда зависимость эффекта изменилась, нужно корректно отменить старый запрос.
    return () => {
      abortController.abort()
    }
  }, [selectedCity])

  const isSearching = searchStatus === 'loading'
  const isWeatherLoading = weatherStatus === 'loading'

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">React + Open-Meteo</p>
          <h1>Учебное приложение о погоде</h1>
          <p className="hero-text">
            Небольшой проект, который показывает основные идеи React на реальном
            примере: работа с состоянием, эффектами, формами, списками и
            условным рендерингом.
          </p>
        </div>

        <div className="concept-list">
          <span>`useState`</span>
          <span>`useEffect`</span>
          <span>props</span>
          <span>controlled input</span>
          <span>conditional rendering</span>
        </div>
      </section>

      <SearchForm
        query={query}
        onQueryChange={setQuery}
        onSubmit={() => void loadCities(query)}
        isLoading={isSearching}
      />

      {errorMessage ? (
        <section className="status status--error" role="alert">
          {errorMessage}
        </section>
      ) : null}

      {isSearching ? (
        <section className="status">Ищем подходящие города...</section>
      ) : null}

      <CityList
        cities={cities}
        selectedCityId={selectedCity?.id ?? null}
        onSelect={setSelectedCity}
      />

      {isWeatherLoading ? (
        <section className="status">Загружаем актуальную погоду и прогноз...</section>
      ) : null}

      {/* Условный рендеринг помогает показывать UI только тогда,
          когда у нас действительно есть нужные данные. */}
      {weather ? (
        <div className="content-grid">
          <WeatherOverview weather={weather} />
          <Forecast weather={weather} />
        </div>
      ) : null}
    </main>
  )
}

export default App
