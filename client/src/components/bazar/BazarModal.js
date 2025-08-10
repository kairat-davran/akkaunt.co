import React from 'react';
import { useTranslation } from 'react-i18next';
import LocationPicker from '../LocationPicker';

const BazarModal = ({
  visible,
  onClose,
  onSubmit,
  itemData,
  setItemData,
  images,
  setImages,
  editing,
  handleImageChange
}) => {
  const { t } = useTranslation();

  const handleChange = e => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  if (!visible) return null;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content p-4 rounded shadow"
        style={{
          maxHeight: '95vh',
          overflowY: 'auto',
        }}>
        <h5>{editing ? t('edit_item') : t('create_item')}</h5>

        <input name="title" className="form-control my-2" placeholder={t('title')} value={itemData.title} onChange={handleChange} />
        <input name="price" className="form-control my-2" placeholder={t('price')} type="number" value={itemData.price} onChange={handleChange} />
        <textarea name="description" className="form-control my-2" placeholder={t('description')} rows="3" value={itemData.description} onChange={handleChange} />
        
        <input
          name="locationDisplay"
          className="form-control my-2"
          placeholder={t('location')}
          value={itemData.location?.display || ''}
          onChange={e => {
            setItemData({
              ...itemData,
              location: {
                ...itemData.location,
                display: e.target.value
              }
            })
          }}
        />

        <div style={{ height: '300px' }}>
          <LocationPicker
            position={
              itemData.location.coordinates.length === 2
                ? [itemData.location.coordinates[1], itemData.location.coordinates[0]]
                : null
            }
            setPosition={(latlng) => {
              setItemData(prev => ({
                ...prev,
                location: {
                  ...prev.location,
                  coordinates: [latlng[1], latlng[0]]
                }
              }));
            }}
          />
        </div>

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
          <label htmlFor="event-images" className="btn">
            <span className="material-icons me-1">upload</span> {t('choose_images')}
          </label>
          <input
            type="file"
            id="event-images"
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
            onClick={onClose}
          >
            {t('cancel')}
          </button>
          <button className="btn btn-success" onClick={onSubmit}>
            {editing ? t('update') : t('post')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BazarModal;