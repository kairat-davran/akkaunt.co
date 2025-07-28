import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../redux/actions/eventAction';
import { GLOBALTYPES } from '../redux/actions/globalTypes';
import imageCompression from 'browser-image-compression';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { key: 'today', icon: 'today', label: 'Today' },
  { key: 'upcoming', icon: 'update', label: 'Upcoming' },
  { key: 'past', icon: 'history', label: 'Past' },
  { key: 'mine', icon: 'person', label: 'My Events' }
];

const initialEventState = {
  title: '',
  description: '',
  date: '',
  location: '',
  category: 'Social',
};

const EventsScreen = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [modalVisible, setModalVisible] = useState(false);
  const [eventData, setEventData] = useState(initialEventState);
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
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "All fields are required." } });
    }

    if (images.length === 0) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Please add at least one image." } });
    }

    const payload = { ...eventData };

    if (editingId) {
      dispatch(updateEvent({ id: editingId, data: payload, images, auth }));
    } else {
      dispatch(createEvent({ data: payload, images, auth, socket }));
    }

    setModalVisible(false);
    setEventData(initialEventState);
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
    if (window.confirm('Are you sure you want to delete this event?')) {
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
        <h3 className="text-capitalize fw-semibold">{activeTab} Events</h3>
        <button className="btn btn-primary" onClick={() => setModalVisible(true)}>
          <span className="material-icons me-2">add_circle</span> Create Event
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
        <p className="text-muted">No events to show.</p>
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
                      <span className="material-icons me-1">favorite</span> Interested
                    </button>
                    {event.organizer._id === auth.user._id && (
                      <div className="event-buttons">
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(event)}>
                          <span className="material-icons me-1">edit</span> Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(event._id)}>
                          <span className="material-icons me-1">delete</span> Delete
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
            <h5>{editingId ? 'Edit Event' : 'Create Event'}</h5>

            <input type="text" name="title" className="form-control my-2" placeholder="Event Title"
              value={eventData.title} onChange={handleChange} />

            <textarea name="description" className="form-control my-2" placeholder="Event Description"
              value={eventData.description} onChange={handleChange} />

            <input type="text" name="location" className="form-control my-2" placeholder="Event Location"
              value={eventData.location} onChange={handleChange} />

            <input type="datetime-local" name="date" className="form-control my-2"
              value={eventData.date || ''} onChange={handleChange} />

            <select name="category" className="form-select my-2"
              value={eventData.category} onChange={handleChange}>
              <option value="Social">Social & Community</option>
              <option value="Education">Education & Career</option>
              <option value="Wellness">Wellness & Lifestyle</option>
            </select>

            <div className="form-group mt-3">
              <label>Event Images</label>
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
                  <span className="material-icons me-1">upload</span> Choose Images
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
              <button className="btn btn-secondary me-2" onClick={() => setModalVisible(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleSubmit}>
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsScreen;