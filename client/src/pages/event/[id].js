import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import { deleteEvent, getEvent, updateEvent } from '../../redux/actions/eventAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import LocationPicker from '../../components/LocationPicker';

const Event = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  
  const dispatch = useDispatch();
  const navigation = useNavigate();

  const { token, user } = useSelector(state => state.auth);
  const { event, loading } = useSelector(state => state.events);
  
  const isOwner = event?.organizer?._id === user?._id;

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: null,
    location: {
      type: 'Point',
      coordinates: [],
      display: ''
    },
    category: '',
    organizer: ''
  });
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) { dispatch(getEvent(id, token)); }
  }, [dispatch, id, token]);

  useEffect(() => {
    if (event && isOwner) {
      setEventData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location,
        category: event.category,
        organizer: event.organizer,
      });
      setImages(event.images || []);
    }
  }, [event, isOwner]);

  const handleChange = e => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleChangeImages = async (e) => {
    const files = [...e.target.files];
    let newImages = [];

    for (const file of files) {
      if (!file) continue;

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });
        newImages.push(compressed);
      } catch (err) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: "Image compression failed." }
        });
      }
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(t('confirm_delete_event'))) {
      dispatch(deleteEvent({ id, token, navigate: navigation }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, date, location } = event;

    if (
      !title ||
      !description ||
      !date ||
      !location.display ||
      !location?.coordinates ||
      location.coordinates.length !== 2
    ) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: t('event_required') } });
    }

    if (images.length === 0) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: t('event_image_required') } });
    }

    const payload = { ...event };

    let success = await dispatch(updateEvent({ id, data: payload, images, token }));

    if (success) {
      setModalVisible(false);
      setImages([]);
    }
  };

  if (loading || !event) return <p className="text-center my-5">{t('loading')}</p>;

  return (
    <div className="event">
      <div className="item-detail">
        <h3 className="mb-3">{event.title}</h3>
        <img
          src={event.images?.[0]?.url || 'https://via.placeholder.com/800x400'}
          className="card-img-top"
          alt={event.title}
        />
        <h4 className="card-title">{event.title}</h4>
        <p className="text-muted">{new Date(event.date).toLocaleString()}</p>
        <p><strong>{t('location')}:</strong> {event.location ? event.location.display : ''}</p>
        <p><strong>{t(`category_${event.category?.toLowerCase()}`)}:</strong> {t(`category_${event.category?.toLowerCase()}`)}</p>
        <p>{event.description}</p>
        <p><strong>{t('organizer')}:</strong> {event.organizer?.username}</p>

        <div className="d-flex justify-content-between align-items-center">
          <button className="btn btn-outline-primary">
            <span className="material-icons me-1">favorite</span> {t('interested')}
          </button>
          {isOwner && (
            <div className="event-buttons">
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={(e) => setModalVisible(true) }
              >
                <span className="material-icons me-1">edit</span> {t('edit')}
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => {handleDelete(e)}}
              >
                <span className="material-icons me-1">delete</span> {t('delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {modalVisible && (
        <div className="modal-backdrop">
          <div
            className="modal-content p-4 rounded shadow"
            style={{
              maxHeight: '95vh',
              overflowY: 'auto',
            }}>
            <h5>{t('edit_event')}</h5>

            <input type="text" name="title" className="form-control my-2"
              placeholder={t('event_title')} value={eventData.title} onChange={handleChange} />

            <textarea name="description" className="form-control my-2"
              placeholder={t('event_description')} value={eventData.description} onChange={handleChange} />

            <input
              type="text"
              name="locationDisplay"
              className="form-control my-2"
              placeholder={t('event_location')}
              value={eventData.location.display}
              onChange={e => {
                setEventData(prev => ({
                  ...prev,
                  location: {
                    ...prev.location,
                    display: e.target.value
                  }
                }));
              }}
            />

            <div style={{ height: '300px' }}>
              <LocationPicker
                position={
                  eventData.location.coordinates?.length === 2
                    ? [eventData.location.coordinates[1], eventData.location.coordinates[0]]
                    : null
                }
                setPosition={(latlng) => {
                  setEventData(prev => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      coordinates: [latlng[1], latlng[0]]
                    }
                  }));
                }}
              />
            </div>

            <input type="datetime-local" name="date" className="form-control my-2"
              value={eventData.date || ''} onChange={handleChange} />

            <select name="category" className="form-select my-2"
              value={eventData.category} onChange={handleChange}>
              <option value="Social">{t('category_social')}</option>
              <option value="Education">{t('category_education')}</option>
              <option value="Wellness">{t('category_wellness')}</option>
            </select>

            <div className="form-group mt-3">
              <label>{t('event_images')}</label>
              <div className="show_images d-flex flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="position-relative m-2">
                    <img
                      src={img.url ? img.url : URL.createObjectURL(img)}
                      alt="event"
                      className="img-thumbnail"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <span className="btn btn-sm btn-danger position-absolute top-0 end-0"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}>
                      &times;
                    </span>
                  </div>
                ))}
              </div>
              
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
                  onChange={handleChangeImages}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setModalVisible(false)}>
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

export default Event;