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
import LocationPicker from '../../components/LocationPicker';
import BazarModal from '../../components/bazar/BazarModal';

const ItemDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { item, loading, saved } = useSelector(state => state.bazar);
  const { token, user } = useSelector(state => state.auth);

  const isOwner = item?.seller?._id === user?._id;
  const isSaved = saved.some(i => i._id === item?._id);

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

  const [modalVisible, setModalVisible] = useState(false);
  const [itemData, setItemData] = useState(initialItemState);
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

    if (images.length === 0) {
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: t('error.no_photo') }
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
        <p><strong>{t('location')}:</strong> {item.location?.display}</p>
        {item.location?.coordinates?.length === 2 && (
          <div className="my-4">
            <LocationPicker
              readonly
              position={[
                item.location.coordinates[1],
                item.location.coordinates[0]
              ]}
            />
          </div>
        )}
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
        <BazarModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setItemData(initialItemState);
            setImages([]);
          }}
          onSubmit={handleSubmit}
          itemData={itemData}
          setItemData={setItemData}
          images={images}
          setImages={setImages}
          editing={true}
          handleImageChange={handleImageChange}
          fallbackLocation={item.location?.coordinates?.length === 2
            ? { lat: item.location.coordinates[1], lng: item.location.coordinates[0] }
            : null}
        />
      )}
    </div>
  );
};

export default ItemDetail;