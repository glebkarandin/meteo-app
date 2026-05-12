export type SearchResult = {
    id: number
    name: string
    country: string
    admin1?: string
    latitude: number
    longitude: number
    timezone: string
  }

export type WeatherSnapshot = {
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
  
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

export type CityListProps = {
    cities: SearchResult[]
    selectedCityId: number | null
    onSelect: (city: SearchResult) => void
  }

export type SearchFormProps = {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export type WeatherOverviewProps = {
  weather: WeatherSnapshot
}

export type ForecastProps = {
  weather: WeatherSnapshot
}
