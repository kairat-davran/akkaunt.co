import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EventCard = ({ event, isOwner, onEdit }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="col-md-6 mb-4">
      <div className="card event-card h-100 shadow-sm" onClick={() => navigate(`/event/id/${event._id}`)} style={{ cursor: 'pointer' }}>
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
          <p className="card-text">{event.location?.display || t('location_unknown')}</p>

          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-outline-primary">
              <span className="material-icons me-1">favorite</span> {t('interested')}
            </button>

            {isOwner && (
              <div className="event-buttons">
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <span className="material-icons me-1">edit</span> {t('edit')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;