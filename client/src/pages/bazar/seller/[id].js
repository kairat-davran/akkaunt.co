import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getItemsBySeller } from '../../../redux/actions/bazarAction';
import ItemCard from '../../../components/bazar/ItemCard';

const SellerProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { seller, sellerItems } = useSelector(state => state.bazar);
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (id) dispatch(getItemsBySeller(id, token));
  }, [id, token, dispatch]);

  if (!seller) return <div className="container py-4">Loading seller profile...</div>;

  const renderStars = (rating = 0) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return (
      <>
        {Array(full).fill().map((_, i) => <i key={`f-${i}`} className="bi bi-star-fill text-warning" />)}
        {half && <i className="bi bi-star-half text-warning" />}
        {Array(empty).fill().map((_, i) => <i key={`e-${i}`} className="bi bi-star text-warning" />)}
      </>
    );
  };

  return (
    <div className="container py-4">
      {/* Seller Info */}
      <div className="d-flex align-items-center mb-4">
        <img
          src={seller.avatar || '/default-avatar.png'}
          alt={seller.username}
          className="rounded-circle me-3"
          style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #ccc' }}
        />
        <div>
          <h4 className="mb-1 d-flex align-items-center">
            {seller.fullname || seller.username}
            {seller.seller?.isTrusted && (
              <span className="badge bg-success ms-2">Verified Seller</span>
            )}
          </h4>
          <p className="mb-1 text-muted">@{seller.username}</p>
          <div className="text-warning mb-1">
            {renderStars(seller.seller?.rating || 0)}{' '}
            <span className="text-secondary ms-1">({seller.seller?.reviews || 0} review{seller.seller?.reviews !== 1 && 's'})</span>
          </div>
          {seller.seller?.sellerSince && (
            <small className="text-muted">Seller since {new Date(seller.seller.sellerSince).toLocaleDateString()}</small>
          )}
        </div>
      </div>

      {/* Listings Overview */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Listings</h5>
        <span className="text-muted">{sellerItems.length} item{sellerItems.length !== 1 && 's'}</span>
      </div>

      {/* Listings Grid */}
      <div className="row">
        {sellerItems.length === 0 ? (
          <p className="text-center">No items listed by this seller yet.</p>
        ) : (
          sellerItems.map(item => (
            <div className="col-md-4 mb-4" key={item._id}>
              <ItemCard item={item} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerProfile;