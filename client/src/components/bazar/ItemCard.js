import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { startBazarConversation } from '../../redux/actions/bazarMessageAction';

const ItemCard = ({ item, isOwner, isSaved, onEdit, onToggleSave }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleMessageSeller = async () => {
    const conversation = await dispatch(startBazarConversation(item._id));
    if (conversation?._id) {
      navigate(`/message/sub/bazar/id/${conversation._id}`);
    }
  };

  return (
    <div className="card">
      <Link to={`/bazar/id/${item._id}`}>
        <img
          src={item.images?.[0]?.url}
          className="card-img-top"
          alt={item.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      </Link>

      <div className="card-body">
        <h5 className="card-title">{item.title}</h5>
        <p className="card-text">${item.price}</p>

        <div className="d-flex justify-content-between">
          <button
            className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={onToggleSave}
            title={isSaved ? 'Unsave' : 'Save'}
          >
            <span className="material-icons">
              {isSaved ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>

          {isOwner ? (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={onEdit}
              title="Edit item"
            >
              <span className="material-icons">edit</span>
            </button>
          ) : (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={handleMessageSeller}
              title="Message seller"
            >
              <span className="material-icons">chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;