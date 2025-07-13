import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createItem } from '../../redux/actions/bazarAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { useNavigate } from 'react-router-dom';

const CreateItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(state => state.auth);

  const [data, setData] = useState({
    title: '',
    price: '',
    description: '',
    location: '',
    category: ''
  });
  const [images, setImages] = useState([]);

  const currentCount = auth.user?.seller?.listingCount || 0;
  const isTrusted = auth.user?.seller?.isTrusted;
  const maxFree = 10;
  const isBlocked = !isTrusted && currentCount >= maxFree;

  const handleChange = e => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    const files = [...e.target.files];
    setImages([...images, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.title || !data.price || !data.location) {
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Title, price, and location are required.' }
      });
    }

    if (isBlocked) {
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Free listing limit reached. Please become a verified seller.' }
      });
    }

    const success = await dispatch(createItem({ data, images, auth }));
    if (success) {
      navigate('/bazar');
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 fw-semibold">Create New Item</h3>

      {isBlocked && (
        <div className="alert alert-warning text-center">
          <strong>You’ve reached your free 10-item limit.</strong><br />
          Please <a href="/become-seller">verify your seller account</a> to continue posting.
        </div>
      )}

      {!isTrusted && (
        <div className="text-muted small mb-3">
          {currentCount} of {maxFree} free listings used
          <div className="progress mt-1" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${(currentCount / maxFree) * 100}%` }}
            />
          </div>
        </div>
      )}

      <form className="create-item-form" onSubmit={handleSubmit}>
        <input
          className="form-control"
          name="title"
          placeholder="Title"
          value={data.title}
          onChange={handleChange}
        />
        <input
          className="form-control"
          name="price"
          placeholder="Price"
          type="number"
          value={data.price}
          onChange={handleChange}
        />
        <textarea
          className="form-control"
          name="description"
          placeholder="Description"
          rows="3"
          value={data.description}
          onChange={handleChange}
        />
        <input
          className="form-control"
          name="location"
          placeholder="Location"
          value={data.location}
          onChange={handleChange}
        />
        <select
          className="form-control"
          name="category"
          value={data.category}
          onChange={handleChange}
        >
          <option value="">Select category</option>
          <option value="foods">Foods</option>
          <option value="services">Services</option>
          <option value="vehicles">Vehicles</option>
          <option value="furniture">Furniture</option>
          <option value="electronics">Electronics</option>
          <option value="etc">Etc</option>
        </select>

        <input
          type="file"
          accept="image/*"
          multiple
          className="form-control"
          onChange={handleImageChange}
        />

        <button className="btn btn-dark mt-3 w-100" disabled={isBlocked}>
          Post Item
        </button>
      </form>
    </div>
  );
};

export default CreateItem;