import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getItemById,
  deleteItem,
  saveItem,
  unsaveItem,
  updateItem
} from '../../redux/actions/bazarAction';
import { useParams, useNavigate, Link } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { useTranslation } from 'react-i18next';

const ItemDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { item, loading, saved } = useSelector(state => state.bazar);
  const { token, user } = useSelector(state => state.auth);

  const isOwner = item?.seller?._id === user?._id;
  const isSaved = saved.some(i => i._id === item?._id);

  const [modalVisible, setModalVisible] = useState(false);
  const [itemData, setItemData] = useState({
    title: '',
    price: '',
    description: '',
    location: '',
    category: ''
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (id) dispatch(getItemById(id, token));
  }, [id, dispatch, token]);

  useEffect(() => {
    if (item && isOwner) {
      setItemData({
        title: item.title,
        price: item.price,
        description: item.description,
        location: item.location,
        category: item.category
      });
      setImages(item.images || []);
    }
  }, [item, isOwner]);

  const handleDelete = () => {
    if (window.confirm(t('confirm_delete'))) {
      dispatch(deleteItem({ id: item._id, auth: { token } }));
      navigate('/bazar');
    }
  };

  const handleToggleSave = () => {
    if (isSaved) {
      dispatch(unsaveItem(item, { token }));
    } else {
      dispatch(saveItem(item, { token }));
    }
  };

  const handleChange = (e) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const files = [...e.target.files];
    let compressedImages = [];

    for (const file of files) {
      if (!file) continue;
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        compressedImages.push(compressed);
      } catch (err) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: "Image compression failed." }
        });
      }
    }

    setImages(prev => [...prev, ...compressedImages]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemData.title || !itemData.price || !itemData.location) {
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: t('required_fields') }
      });
    }
    const success = await dispatch(updateItem({
      id: item._id,
      data: itemData,
      images,
      auth: { token, user }
    }));

    if (success) {
      setModalVisible(false);
    }
  };

  if (loading || !item) return <p className="text-center my-5">{t('loading')}</p>;

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

        <p><strong>{t('price')}:</strong> ${item.price}</p>
        <p><strong>{t('description')}:</strong><br />{item.description}</p>
        <p><strong>{t('location')}:</strong> {item.location}</p>
        <p>
          <strong>{t('seller')}:</strong>{' '}
          <Link to={`/bazar/sub/seller/id/${item.seller?._id}`}>
            {item.seller?.username}
          </Link>
        </p>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-outline-primary" onClick={handleToggleSave}>
            <span className="material-icons me-1">
              {isSaved ? 'bookmark' : 'bookmark_border'}
            </span>
            {isSaved ? t('saved') : t('save')}
          </button>

          {isOwner ? (
            <>
              <button className="btn btn-outline-secondary" onClick={() => setModalVisible(true)}>
                <span className="material-icons me-1">edit</span> {t('edit_item')}
              </button>

              <button className="btn btn-danger" onClick={handleDelete}>
                <span className="material-icons me-1">delete</span> {t('delete')}
              </button>
            </>
          ) : (
            <button
              className="btn btn-outline-success"
              onClick={() => navigate(`/message/sub/bazar/id/${item.seller._id}`)}
            >
              <span className="material-icons me-1">chat</span> {t('message')}
            </button>
          )}
        </div>
      </div>

      {modalVisible && (
        <div className="modal-backdrop">
          <div className="modal-content p-4 rounded shadow">
            <h5>{t('edit_item')}</h5>

            <input name="title" className="form-control my-2" placeholder={t('title')} value={itemData.title} onChange={handleChange} />
            <input name="price" className="form-control my-2" placeholder={t('price')} type="number" value={itemData.price} onChange={handleChange} />
            <textarea name="description" className="form-control my-2" placeholder={t('description')} rows="3" value={itemData.description} onChange={handleChange} />
            <input name="location" className="form-control my-2" placeholder={t('location')} value={itemData.location} onChange={handleChange} />

            <select name="category" className="form-select my-2" value={itemData.category} onChange={handleChange}>
              <option value="">{t('select_category')}</option>
              <option value="foods">{t('category_foods')}</option>
              <option value="services">{t('category_services')}</option>
              <option value="vehicles">{t('category_vehicles')}</option>
              <option value="furniture">{t('category_furniture')}</option>
              <option value="electronics">{t('category_electronics')}</option>
              <option value="etc">{t('category_etc')}</option>
            </select>

            <label className="form-label mt-3">{t('images')}</label>
            <div className="custom-file-upload mt-2">
              <label htmlFor="item-images" className="btn">
                <span className="material-icons me-1">upload</span> {t('choose_images')}
              </label>
              <input
                type="file"
                id="item-images"
                name="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>

            <div className="d-flex flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="m-2 position-relative">
                  <img
                    src={img.url ? img.url : URL.createObjectURL(img)}
                    className="img-thumbnail"
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                    alt="preview"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setModalVisible(false)}
              >
                {t('cancel')}
              </button>
              <button className="btn btn-success" onClick={handleSubmit}>
                {t('update')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;