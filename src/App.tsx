import { useEffect, useState } from 'react'
import './App.css'
import type { ApiStatus, SearchResult, WeatherSnapshot } from './type'
import { formatCityLabel } from './functions'
import { CityList, Forecast, SearchForm, WeatherOverview } from './components'

const DEFAULT_CITY = 'Moscow'

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
