import React from 'react'
import { useTranslation } from 'react-i18next'

const CategoryFilter = ({ selected, setSelected }) => {
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
    <div className="bazar-tabs d-flex flex-wrap mb-4">
      {categories.map(cat => (
        <button
          key={cat}
          className={`bazar-tab-btn me-2 mb-2 ${selected.toLowerCase() === cat ? 'active' : ''}`}
          onClick={() => setSelected(cat.charAt(0).toUpperCase() + cat.slice(1))}
        >
          {t(`category_${cat}`)}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter