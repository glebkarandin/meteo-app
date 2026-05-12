type SearchFormProps = {
    query: string
    onQueryChange: (value: string) => void
    onSubmit: () => void
    isLoading: boolean
}

export const SearchForm = ({
    query,
    onQueryChange,
    onSubmit,
    isLoading,
  }: SearchFormProps) => {
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
