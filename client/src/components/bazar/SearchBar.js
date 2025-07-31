import React from 'react'
import { useTranslation } from 'react-i18next'

const SearchBar = ({ search, setSearch }) => {
  const { t } = useTranslation()

  const handleSearch = e => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSearch} className="bazar-filters p-3 rounded border mb-4 d-flex gap-2">
      <input
        type="text"
        className="form-control"
        placeholder={t('search_placeholder')}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <button className="btn btn-outline-dark">{t('search')}</button>
    </form>
  )
}

export default SearchBar