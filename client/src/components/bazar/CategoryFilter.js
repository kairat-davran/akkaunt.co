import React from 'react'
import { useTranslation } from 'react-i18next'

const CategoryFilter = ({ selected, setSelected, onLocationClick }) => {
  const { t } = useTranslation()

  const categories = [
    'all',
    'foods',
    'services',
    'vehicles',
    'furniture',
    'electronics'
  ]

  return (
    <div className="bazar-tabs d-flex flex-wrap justify-content-between align-items-center">
      <div className="d-flex flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            className={`bazar-tab-btn ${selected.toLowerCase() === cat ? 'active' : ''}`}
            onClick={() => setSelected(cat.charAt(0).toUpperCase() + cat.slice(1))}
          >
            {t(`category_${cat}`)}
          </button>
        ))}
      </div>

      <button
        className="btn btn-outline-primary my-4"
        onClick={onLocationClick}
      >
        <span className="material-icons me-1">place</span>
        {t('filter_location')}
      </button>
    </div>
  )
}

export default CategoryFilter