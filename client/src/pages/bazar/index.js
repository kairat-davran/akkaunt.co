import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getItems } from '../../redux/actions/bazarAction';
import ItemCard from '../../components/bazar/ItemCard';
import CategoryFilter from '../../components/bazar/CategoryFilter';
import SearchBar from '../../components/bazar/SearchBar';
import { Link } from 'react-router-dom';

const BazarScreen = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.bazar);
  const auth = useSelector(state => state.auth);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    dispatch(getItems(auth.token, searchKeyword, selectedCategory));
  }, [dispatch, auth.token, searchKeyword, selectedCategory]);

  return (
    <div className="bazar-screen px-md-4 px-2 py-5">
      {/* Header */}
      {/* <div className="bazar-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4"> */}
      <div className="bazar-header d-flex flex-row justify-content-between align-items-center mb-4 flex-wrap">
        <h3 className="text-capitalize fw-semibold mb-2 mb-md-0">Bazar</h3>

        <div className="d-flex align-items-center gap-2">
          {auth.token && (
            <Link to="/bazar/create" className="btn btn-primary d-flex align-items-center">
              <span className="material-icons me-1">add_circle</span> Add Item
            </Link>
          )}

          {auth.user?.seller?.sellerSince ? (
            <Link to={`/bazar/seller/${auth.user._id}`} className="text-muted small">
              <img
                src={auth.user.avatar}
                alt={auth.user.username}
                title="My Store"
                className="bazar-avatar"
              />
            </Link>
          ) : (
            <img
              src={auth.user.avatar}
              alt={auth.user.username}
              title={auth.user.username}
              className="bazar-avatar"
            />
        )}
        </div>
      </div>

      {/* Filters */}
      <div className="bazar-filters mb-4">
        <SearchBar search={searchKeyword} setSearch={setSearchKeyword} />
        <CategoryFilter selected={selectedCategory} setSelected={setSelectedCategory} />
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center mt-4">No items found for your search.</p>
      ) : (
        <div className="row">
          {items.map(item => (
            <div className="col-6 col-md-4 col-lg-3 mb-4" key={item._id}>
              <div className="card bazar-card h-100 shadow-sm">
                <ItemCard item={item} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BazarScreen;