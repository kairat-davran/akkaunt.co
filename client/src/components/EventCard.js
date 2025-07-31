import React from 'react';
import { useTranslation } from 'react-i18next';

const EventCard = ({ event }) => {
  const { t } = useTranslation();

  return (
    <div className="card shadow-sm mb-4">
      <img
        src={event.images?.[0]?.url || 'https://via.placeholder.com/800x400'}
        className="card-img-top"
        alt={event.title}
      />
      <div className="card-body">
        <h4 className="card-title">{event.title}</h4>
        <p className="text-muted">{new Date(event.date).toLocaleString()}</p>
        <p><strong>{t('location')}:</strong> {event.location}</p>
        <p><strong>{t(`category_${event.category?.toLowerCase()}`)}:</strong> {t(`category_${event.category?.toLowerCase()}`)}</p>
        <p>{event.description}</p>
        <p><strong>{t('organizer')}:</strong> {event.organizer?.username}</p>
      </div>
    </div>
  );
};

export default EventCard;