const SearchBar = ({ search, setSearch }) => {
  const handleSearch = e => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSearch} className="bazar-filters p-3 rounded border mb-4 d-flex gap-2">
      <input
        type="text"
        className="form-control"
        placeholder="Search items..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <button className="btn btn-outline-dark">Search</button>
    </form>
  );
};

export default SearchBar;