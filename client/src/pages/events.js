import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../redux/actions/eventAction';
import { GLOBALTYPES } from '../redux/actions/globalTypes';
import imageCompression from 'browser-image-compression';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
    location: '',
    category: 'Social'
  });
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();
  const now = new Date();
  const dispatch = useDispatch();
  const events = useSelector(state => state.events.events);
  const auth = useSelector(state => state.auth);
  const socket = useSelector(state => state.communication.socket);

  useEffect(() => {
    if (auth?.token) dispatch(getEvents(auth.token));
  }, [dispatch, auth]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, description, date, location } = eventData;

    if (!title || !description || !date || !location) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: t('event_required') } });
    }

    if (images.length === 0) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: t('event_image_required') } });
    }

    const payload = { ...eventData };

    if (editingId) {
      dispatch(updateEvent({ id: editingId, data: payload, images, auth }));
    } else {
      dispatch(createEvent({ data: payload, images, auth, socket }));
    }

    setModalVisible(false);
    setEventData({ title: '', description: '', date: '', location: '', category: 'Social' });
    setImages([]);
    setEditingId(null);
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

  const handleDelete = id => {
    if (window.confirm(t('confirm_delete_event'))) {
      dispatch(deleteEvent({ id, auth }));
    }
  };

  const filteredEvents = events?.filter(event => {
    const eventDate = new Date(event.date);
    if (activeTab === 'mine') return event.organizer._id === auth.user._id;
    if (activeTab === 'today') return eventDate.toDateString() === now.toDateString();
    if (activeTab === 'upcoming') return eventDate > now;
    if (activeTab === 'past') return eventDate < now && eventDate.toDateString() !== now.toDateString();
    return true;
  }) || [];

  return (
    <div className="events-screen container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-capitalize fw-semibold">{t(`event_tab_${activeTab}`)} {t('events')}</h3>
        <button className="btn btn-primary" onClick={() => setModalVisible(true)}>
          <span className="material-icons me-2">add_circle</span> {t('create_event')}
        </button>
      </div>

      <ul className="events-tabs nav nav-pills mb-4">
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

      {filteredEvents.length === 0 ? (
        <p className="text-muted">{t('no_events')}</p>
      ) : (
        <div className="row">
          {filteredEvents.map(event => (
            <div className="col-md-6 mb-4" key={event._id}>
              <div
                className="card event-card h-100 shadow-sm"
                onClick={() => navigate(`/event/id/${event._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={event.images?.[0]?.url || 'https://via.placeholder.com/800x400?text=Event'}
                  className="card-img-top"
                  alt={event.title}
                />
                <div className="card-body">
                  <h5 className="card-title">{event.title}</h5>
                  <p className="card-text text-muted">
                    {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString()}
                  </p>
                  <p className="card-text">{event.location}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <button className="btn btn-outline-primary">
                      <span className="material-icons me-1">favorite</span> {t('interested')}
                    </button>
                    {event.organizer._id === auth.user._id && (
                      <div className="event-buttons">
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(event)
                          }}>
                          <span className="material-icons me-1">edit</span> {t('edit')}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(event._id)}
                          }>
                          <span className="material-icons me-1">delete</span> {t('delete')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalVisible && (
        <div className="modal-backdrop">
          <div className="modal-content p-4 rounded shadow">
            <h5>{editingId ? t('edit_event') : t('create_event')}</h5>

            <input type="text" name="title" className="form-control my-2"
              placeholder={t('event_title')} value={eventData.title} onChange={handleChange} />

            <textarea name="description" className="form-control my-2"
              placeholder={t('event_description')} value={eventData.description} onChange={handleChange} />

            <input type="text" name="location" className="form-control my-2"
              placeholder={t('event_location')} value={eventData.location} onChange={handleChange} />

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