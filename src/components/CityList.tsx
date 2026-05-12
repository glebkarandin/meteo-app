import type { CityListProps } from "../type"

export const CityList = ({ cities, selectedCityId, onSelect }: CityListProps) => {
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
