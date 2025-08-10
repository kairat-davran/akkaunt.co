import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getItems,
  createItem,
  updateItem,
  saveItem,
  unsaveItem,
  getSavedItems
} from '../redux/actions/bazarAction'
import ItemCard from '../components/bazar/ItemCard'
import CategoryFilter from '../components/bazar/CategoryFilter'
import SearchBar from '../components/bazar/SearchBar'
import imageCompression from 'browser-image-compression'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { useTranslation } from 'react-i18next'
import LocationPicker from '../components/LocationPicker'
import BazarModal from '../components/bazar/BazarModal'

const BazarScreen = () => {
  const dispatch = useDispatch();
  const { items, loading, saved } = useSelector(state => state.bazar);
  const auth = useSelector(state => state.auth);
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [radius, setRadius] = useState(10000);
  const [tempRadius, setTempRadius] = useState(null);

  const initialItemState = {
    title: '',
    price: '',
    description: '',
    location: {
      type: 'Point',
      coordinates: [],
      display: ''
    },
    category: ''
  }

  const [itemData, setItemData] = useState(initialItemState);
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => console.warn("Geolocation error", err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (auth.token && userLocation) {
      dispatch(getItems(auth.token, searchKeyword, selectedCategory, userLocation, radius));
      dispatch(getSavedItems(auth.token));
    }
  }, [dispatch, auth.token, searchKeyword, selectedCategory, userLocation, radius]);

  const handleImageChange = async (e) => {
    const files = [...e.target.files]
    let compressedImages = []

    for (const file of files) {
      if (!file) continue
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        })
        compressedImages.push(compressed)
      } catch (err) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: "Image compression failed." }
        })
      }
    }

    setImages(prev => [...prev, ...compressedImages])
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemData.title || !itemData.price || !itemData.location) {
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: t('required_fields') }
      });
    }

    if (images.length === 0) {
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: t('error.no_photo') }
      });
    }

    const payload = {
      ...itemData,
      location: {
        type: 'Point',
        coordinates:
          itemData.location.coordinates.length === 2
            ? itemData.location.coordinates
            : userLocation
              ? [userLocation.lng, userLocation.lat]
              : [0, 0],
        display: itemData.location.display
      }
    };

    let success;
    if (editingId) {
      success = await dispatch(updateItem({ id: editingId, data: payload, images, auth }));
    } else {
      success = await dispatch(createItem({ data: payload, images, auth }));
    }

    if (success) {
      setModalVisible(false);
      setItemData(initialItemState);
      setImages([]);
      setEditingId(null);
    }
  };

  const handleEdit = (item) => {
    setItemData({
      title: item.title,
      price: item.price,
      description: item.description,
      location: item.location,
      category: item.category
    })
    setImages(item.images || [])
    setEditingId(item._id)
    setModalVisible(true)
  }

  return (
    <div className="bazar-screen px-md-4 px-2 py-5">
      <div className="bazar-header d-flex flex-row justify-content-between align-items-center mb-4 flex-wrap">
        <h3 className="text-capitalize fw-semibold mb-2 mb-md-0">{t('bazar_title')}</h3>

        <div className="d-flex align-items-center gap-2">
          {auth.token && (
            <button className="btn btn-primary d-flex align-items-center" onClick={() => setModalVisible(true)}>
              <span className="material-icons me-1">add_circle</span> {t('add_item')}
            </button>
          )}

          <img
            src={auth.user.avatar}
            alt={auth.user.username}
            title={auth.user.username}
            className="bazar-avatar"
          />
        </div>
      </div>

      <div className="bazar-filters mb-4">
        <SearchBar search={searchKeyword} setSearch={setSearchKeyword} />
        <CategoryFilter 
          selected={selectedCategory}
          setSelected={setSelectedCategory}
          onLocationClick={() => {
            setTempLocation(userLocation);
            setTempRadius(radius);
            setLocationModalVisible(true);
          }} />
        {locationModalVisible && (
          <div className="modal-backdrop">
            <div className="modal-content p-4 rounded shadow" style={{ maxWidth: 600, margin: 'auto' }}>
              <h5>{t('adjust_location_radius')}</h5>

              <label className="form-label mt-2">
                {t('search_radius')} ({(tempRadius / 1000).toFixed(1)} km)
              </label>
              <input
                type="range"
                className="form-range"
                min={1000}
                max={50000}
                step={1000}
                value={tempRadius}
                onChange={e => setTempRadius(Number(e.target.value))}
              />

              <div style={{ height: '300px' }} className="my-3">
                <LocationPicker
                  position={tempLocation}
                  setPosition={(latlng) => setTempLocation({ lat: latlng[0], lng: latlng[1] })}
                  radius={tempRadius}
                />
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-secondary me-2" onClick={() => setLocationModalVisible(false)}>
                  {t('cancel')}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setUserLocation(tempLocation);
                    setRadius(tempRadius);
                    setLocationModalVisible(false);
                  }}
                >
                  {t('apply')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center mt-4">{t('no_items_found')}</p>
      ) : (
        <div className="row">
          {items.map(item => {
            const isOwner = item.seller?._id === auth.user?._id
            const isSaved = saved.some(i => i._id === item._id)

            return (
              <div className="col-6 col-md-4 col-lg-3 mb-4" key={item._id}>
                <ItemCard
                  item={item}
                  isOwner={isOwner}
                  isSaved={isSaved}
                  onEdit={() => handleEdit(item)}
                  onToggleSave={() =>
                    isSaved
                      ? dispatch(unsaveItem(item, auth))
                      : dispatch(saveItem(item, auth))
                  }
                />
              </div>
            )
          })}
        </div>
      )}

      {modalVisible && (
        <BazarModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setItemData(initialItemState);
            setImages([]);
            setEditingId(null);
          }}
          onSubmit={handleSubmit}
          itemData={itemData}
          setItemData={setItemData}
          images={images}
          setImages={setImages}
          editing={!!editingId}
          handleImageChange={handleImageChange}
        />
      )}
    </div>
  )
}

export default BazarScreen