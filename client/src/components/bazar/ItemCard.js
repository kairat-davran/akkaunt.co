import React from 'react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => (
  <div className="card">
    <Link to={`/bazar/${item._id}`}>
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
      <Link to={`/bazar/seller/${item.seller?._id}`} className="text-muted small">
        {item.seller?.username}
      </Link>
    </div>
  </div>
);

export default ItemCard;