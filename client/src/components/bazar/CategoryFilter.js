const CategoryFilter = ({ selected, setSelected }) => {
  const categories = [
    'All',
    'Foods',
    'Services',
    'Vehicles',
    'Furniture',
    'Electronics',
  ];

  return (
    <div className="bazar-tabs d-flex flex-wrap mb-4">
      {categories.map(cat => (
        <button
          key={cat}
          className={`bazar-tab-btn me-2 mb-2 ${selected === cat ? 'active' : ''}`}
          onClick={() => setSelected(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;