import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getItemsBySeller,
  saveItem,
  unsaveItem,
  updateItem
} from '../../../redux/actions/bazarAction';
import ItemCard from '../../../components/bazar/ItemCard';
import BazarModal from '../../../components/bazar/BazarModal';
import imageCompression from 'browser-image-compression';
import { GLOBALTYPES } from '../../../redux/actions/globalTypes';
import { useTranslation } from 'react-i18next';

const SellerProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { seller, sellerItems, saved } = useSelector(state => state.bazar);
  const { token, user } = useSelector(state => state.auth);

  const isMyProfile = seller?._id === user?._id;

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
  };

  const [itemData, setItemData] = useState(initialItemState);
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) dispatch(getItemsBySeller(id, token));
  }, [id, token, dispatch]);

  const handleEdit = (item) => {
    setItemData({
      title: item.title,
      price: item.price,
      description: item.description,
      location: item.location,
      category: item.category
    });
    setImages(item.images || []);
    setEditingId(item._id);
    setModalVisible(true);
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
          useWebWorker: true
        });
        compressedImages.push(compressed);
      } catch (err) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: 'Image compression failed.' }
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

    if (images.length === 0) {
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: t('error.no_photo') }
      });
    }

    const payload = {
      ...itemData,
      location: {
        ...itemData.location,
        type: 'Point',
        coordinates: itemData.location.coordinates
      }
    };

    const success = await dispatch(updateItem({
      id: editingId,
      data: payload,
      images,
      auth: { token, user }
    }));

    if (success) {
      setModalVisible(false);
      setItemData(initialItemState);
      setImages([]);
      setEditingId(null);
    }
  };

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

  if (!seller) return <div className="container py-4">{t('loading_seller')}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <img
          src={seller.avatar || '/default-avatar.png'}
          alt={seller.username}
          className="rounded-circle me-3"
          style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #ccc', marginRight: '20px' }}
        />
        <div>
          <h4 className="mb-1 d-flex align-items-center">
            {seller.fullname || seller.username}
            {seller.seller?.isTrusted && (
              <span className="badge bg-success ms-2">{t('verified_seller')}</span>
            )}
          </h4>
          <p className="mb-1 text-muted">@{seller.username}</p>
          <div className="text-warning mb-1">
            {renderStars(seller.seller?.rating || 0)}{' '}
            <span className="text-secondary ms-1">
              {t('review_with_count', { count: seller.seller?.reviews || 0 })}
            </span>
          </div>
          {seller.seller?.sellerSince && (
            <small className="text-muted">
              {t('seller_since')} {new Date(seller.seller.sellerSince).toLocaleDateString()}
            </small>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{t('listings')}</h5>
        <span className="text-muted">
          {t('item_with_count', { count: sellerItems.length })}
        </span>
      </div>

      <div className="row">
        {sellerItems.length === 0 ? (
          <p className="text-center">{t('no_items_by_seller')}</p>
        ) : (
          sellerItems.map(item => {
            const isSaved = saved?.some(i => i._id === item._id);

            return (
              <div className="col-md-4 mb-4" key={item._id}>
                <ItemCard
                  item={item}
                  isOwner={isMyProfile}
                  isSaved={isSaved}
                  onEdit={() => handleEdit(item)}
                  onToggleSave={() =>
                    isSaved
                      ? dispatch(unsaveItem(item, { token }))
                      : dispatch(saveItem(item, { token }))
                  }
                />
              </div>
            );
          })
        )}
      </div>

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
  );
};

export default SellerProfile;