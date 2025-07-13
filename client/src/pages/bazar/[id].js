import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getItemById, deleteItem } from '../../redux/actions/bazarAction';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ItemDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { item, loading } = useSelector(state => state.bazar);
  const { token, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (id) dispatch(getItemById(id, token));
  }, [id, dispatch, token]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteItem({ id: item._id, auth: { token } }));
      navigate('/bazar');
    }
  };

  if (loading || !item) return <p className="text-center my-5">Loading...</p>;

  const isOwner = user._id === item.seller._id;

  return (
    <div className="container py-4">
      <div className="item-detail">
        <h3 className="mb-3">{item.title}</h3>

        {item.images?.[0]?.url && (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="img-fluid w-100 mb-3"
          />
        )}

        <p><strong>Price:</strong> ${item.price}</p>
        <p><strong>Description:</strong><br />{item.description}</p>
        <p><strong>Location:</strong> {item.location}</p>
        <p>
          <strong>Seller:</strong>{' '}
          <Link to={`/bazar/seller/${item.seller?._id}`}>
            {item.seller?.username}
          </Link>
        </p>

        {isOwner && (
          <button className="btn btn-danger mt-3" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i> Delete Item
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;