import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoadIcon from '../../images/loading.gif';
import EventCard from '../../components/EventCard';
import { getEvent } from '../../redux/actions/eventAction';

const Event = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  const auth = useSelector(state => state.auth);
  const events = useSelector(state => state.events.events);
  const dispatch = useDispatch();

  useEffect(() => {
    const existing = events.find(ev => ev._id === id);
    if (existing) {
      setEvent(existing);
    } else {
      dispatch(getEvent({ id, detailEvent: events, auth }));
    }
  }, [dispatch, id, auth, events]);

  useEffect(() => {
    const updated = events.find(ev => ev._id === id);
    if (updated) setEvent(updated);
  }, [events, id]);

  return (
    <div className="container py-4">
      {!event ? (
        <img src={LoadIcon} alt="loading" className="d-block mx-auto my-4" />
      ) : (
        <EventCard event={event} />
      )}
    </div>
  );
};

export default Event;