// components/EventCard.js
import React from 'react';

const EventCard = ({ event }) => {
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
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Category:</strong> {event.category}</p>
        <p>{event.description}</p>
        <p><strong>Organizer:</strong> {event.organizer?.username}</p>
      </div>
    </div>
  );
};

export default EventCard;