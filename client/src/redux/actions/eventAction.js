import { GLOBALTYPES } from './globalTypes'
import { imageUpload } from '../../utils/imageUpload'
import { deleteDataAPI, getDataAPI, patchDataAPI, postDataAPI } from '../../utils/fetchData'

export const EVENT_TYPES = {
  CREATE_EVENT: 'CREATE_EVENT',
  GET_EVENTS: 'GET_EVENTS',
  GET_EVENT: 'GET_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  LOADING_EVENT: 'LOADING_EVENT',
}

export const createEvent = ({ data, images, token, socket }) => async (dispatch) => {
  let media = []

  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })

    if (images.length > 0) {
      media = await imageUpload(images, token);
    }

    const payload = {
      ...data,
      location: {
        type: 'Point',
        coordinates: data.location.coordinates,
        display: data.location.display || ''
      },
      images: media
    };

    const res = await postDataAPI('events', payload, token)

    dispatch({ type: EVENT_TYPES.CREATE_EVENT, payload: res.data.newEvent })
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })

    // Optional: Send notification via socket
    // socket.emit('newEvent', res.data.newEvent)
    return true
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Event creation failed' }
    })
    return false
  }
}

export const getEvents = (token, userLocation = null, radius = null) => async (dispatch) => {
  try {
    dispatch({ type: EVENT_TYPES.LOADING_EVENT, payload: true });

    const qs = new URLSearchParams();
    if (userLocation?.lat != null && userLocation?.lng != null) {
      qs.append('lat', userLocation.lat);
      qs.append('lng', userLocation.lng);
    }
    if (radius != null) qs.append('radius', String(radius));

    const url = qs.toString() ? `events?${qs.toString()}` : 'events';
    const res = await getDataAPI(url, token);

    dispatch({ type: EVENT_TYPES.GET_EVENTS, payload: res.data });
    dispatch({ type: EVENT_TYPES.LOADING_EVENT, payload: false });
  } catch (err) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg || 'Failed to load events' } });
  }
};

export const getEvent = (id, token) => async (dispatch) => {
  try {
    dispatch({ type: EVENT_TYPES.LOADING_EVENT, payload: true });

    const res = await getDataAPI(`event/${id}`, token);

    dispatch({ type: EVENT_TYPES.GET_EVENT, payload: res.data.event });

    dispatch({ type: EVENT_TYPES.LOADING_EVENT, payload: false });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Failed to fetch event' }
    });
  }
};

export const updateEvent = ({ id, data, images, token }) => async (dispatch) => {
  try {
    let media = [];

    const newImages = images.filter(img => !img.url);
    const oldImages = images.filter(img => img.url);
  
    if (newImages.length > 0) {
      media = await imageUpload(newImages, token);
    }

    const payload = {
      ...data,
      location: {
        type: 'Point',
        coordinates: data.location.coordinates,
        display: data.location.display || ''
      },
      images: [...oldImages, ...media],
    };

    const res = await patchDataAPI(`event/${id}`, payload, token);

    dispatch({ type: EVENT_TYPES.UPDATE_EVENT, payload: res.data.updatedEvent })
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })

    return true;
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Update failed' }
    })
    return false
  }
}

export const deleteEvent = ({ id, token, navigate }) => async (dispatch) => {
  try {
    await deleteDataAPI(`event/${id}`, token)
    dispatch({ type: EVENT_TYPES.DELETE_EVENT, payload: id })
    if (navigate) navigate(-1)
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Delete failed' }
    })
  }
}