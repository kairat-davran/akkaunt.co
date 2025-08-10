import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents, createEvent, updateEvent } from '../redux/actions/eventAction';
import { GLOBALTYPES } from '../redux/actions/globalTypes';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'react-i18next';
import LocationPicker from '../components/LocationPicker';
import EventCard from '../components/event/EventCard';

const EventsScreen = () => {
  const { t } = useTranslation();

  const tabs = [
    { key: 'today', icon: 'today', label: t('event_tab_today') },
    { key: 'upcoming', icon: 'update', label: t('event_tab_upcoming') },
    { key: 'past', icon: 'history', label: t('event_tab_past') },
    { key: 'mine', icon: 'person', label: t('event_tab_mine') }
  ];

  const [activeTab, setActiveTab] = useState('today');
  const [modalVisible, setModalVisible] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    location: {
      type: 'Point',
      coordinates: [],
      display: ''
    },
    category: 'Social'
  });
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [userLocation, setUserLocation] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [radius, setRadius] = useState(10000);
  const [tempRadius, setTempRadius] = useState(null);

  const now = new Date();
  const dispatch = useDispatch();
  const events = useSelector(state => state.events.events);
  const { token, user } = useSelector(state => state.auth);
  const socket = useSelector(state => state.communication.socket);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => console.warn('Geolocation error', err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!token) return;
    dispatch(getEvents(token, userLocation, radius));
  }, [dispatch, token, userLocation, radius]);

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
          payload: { error: t('image_compression_failed') }
        });
      }
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, date, location } = eventData;

    if (
      !title ||
      !description ||
      !date ||
      !location?.coordinates ||
      location.coordinates.length !== 2
    ) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: t('event_required') } });
    }

    if (images.length === 0) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: t('event_image_required') } });
    }

    const payload = { ...eventData };

    let success;
    if (editingId) {
      success = await dispatch(updateEvent({ id: editingId, data: payload, images, token }));
    } else {
      success = await dispatch(createEvent({ data: payload, images, token, socket }));
    }

    if (success) {
      setModalVisible(false);
      setEventData({ title: '', description: '', date: '', location: { type: 'Point', coordinates: [], display: '' }, category: 'Social' });
      setImages([]);
      setEditingId(null);
    }
  };

  const handleEdit = event => {
    const formattedDate = new Date(event.date).toISOString().slice(0, 16);

    setEventData({
      title: event.title,
      description: event.description,
      date: formattedDate,
      location: event.location,
      category: event.category,
    });
    setImages(event.images || []);
    setModalVisible(true);
    setEditingId(event._id);
  };

  const filteredEvents = events?.filter(event => {
    const eventDate = new Date(event.date);
    if (activeTab === 'mine') return event.organizer._id === user?._id;
    if (activeTab === 'today') return eventDate.toDateString() === now.toDateString();
    if (activeTab === 'upcoming') return eventDate > now;
    if (activeTab === 'past') return eventDate < now && eventDate.toDateString() !== now.toDateString();
    return true;
  }) || [];

  return (
    <div className="events-screen container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-semibold">{t(`event_tab_${activeTab}`)} {t('event')}</h3>
        <button className="btn btn-primary" onClick={() => setModalVisible(true)}>
          <span className="material-icons me-2">add_circle</span> {t('create_event')}
        </button>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center">
        <ul className="events-tabs nav nav-pills my-4">
          {tabs.map(tab => (
            <li className="nav-item" key={tab.key}>
              <button
                className={`events-tab-btn d-flex align-items-center ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="material-icons me-2">{tab.icon}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="btn btn-outline-primary my-4"
          onClick={() => {
            setTempLocation(
              eventData.location?.coordinates.length === 2
                ? { lat: eventData.location.coordinates[1], lng: eventData.location.coordinates[0] }
                : userLocation
            );
            setTempRadius(radius);
            setLocationModalVisible(true);
          }}
        >
          <span className="material-icons me-1">place</span> {t('filter_location')}
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-muted">{t('no_events')}</p>
      ) : (
        <div className="row">
          {filteredEvents.map(event => (
            <EventCard
              key={event._id}
              event={event}
              isOwner={event.organizer._id === user?._id}
              onEdit={() => handleEdit(event)}
            />
          ))}
        </div>
      )}

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
              value={tempRadius ?? 10000}
              onChange={e => setTempRadius(Number(e.target.value))}
            />

            <div style={{ height: '300px' }} className="my-3">
              <LocationPicker
                position={tempLocation}
                setPosition={(latlng) => setTempLocation({ lat: latlng[0], lng: latlng[1] })}
                radius={tempRadius ?? 10000}
              />
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setLocationModalVisible(false)}>
                {t('cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setRadius(tempRadius ?? 10000);
                  if (tempLocation?.lat != null && tempLocation?.lng != null) {
                    setEventData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        coordinates: [tempLocation.lng, tempLocation.lat]
                      }
                    }));
                  }
                  setLocationModalVisible(false);
                }}
              >
                {t('apply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVisible && (
        <div className="modal-backdrop">
          <div
            className="modal-content p-4 rounded shadow"
            style={{ maxHeight: '95vh', overflowY: 'auto' }}
          >
            <h5>{editingId ? t('edit_event') : t('create_event')}</h5>

            <input
              type="text"
              name="title"
              className="form-control my-2"
              placeholder={t('event_title')}
              value={eventData.title}
              onChange={handleChange}
            />

            <textarea
              name="description"
              className="form-control my-2"
              placeholder={t('event_description')}
              value={eventData.description}
              onChange={handleChange}
            />

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

            <div style={{ height: '300px' }} className="my-3">
              <LocationPicker
                position={
                  eventData.location.coordinates?.length === 2
                    ? [eventData.location.coordinates[1], eventData.location.coordinates[0]]
                    : userLocation
                      ? [userLocation.lat, userLocation.lng]
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
                // Optional: show the chosen search radius on this map too
                radius={radius}
              />
            </div>

            <input
              type="datetime-local"
              name="date"
              className="form-control my-2"
              value={eventData.date || ''}
              onChange={handleChange}
            />

            <select
              name="category"
              className="form-select my-2"
              value={eventData.category}
              onChange={handleChange}
            >
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
                    <span
                      className="btn btn-sm btn-danger position-absolute top-0 end-0"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    >
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
                {editingId ? t('update') : t('create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsScreen;