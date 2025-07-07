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

export const createEvent = ({ data, images, auth, socket }) => async (dispatch) => {
  let media = []

  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })

    if (images.length > 0) {
      media = await imageUpload(images, auth.token);
    }

    const payload = { ...data, images: media }

    const res = await postDataAPI('events', payload, auth.token)

    dispatch({ type: EVENT_TYPES.CREATE_EVENT, payload: res.data.newEvent })

    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })

    // Optional: Send notification via socket
    // socket.emit('newEvent', res.data.newEvent)
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Event creation failed' }
    })
  }
}

export const getEvents = (token) => async (dispatch) => {
  try {
    dispatch({ type: EVENT_TYPES.LOADING_EVENT, payload: true })

    const res = await getDataAPI('events', token)

    dispatch({ type: EVENT_TYPES.GET_EVENTS, payload: res.data })
    dispatch({ type: EVENT_TYPES.LOADING_EVENT, payload: false })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Failed to load events' }
    })
  }
}

export const getEvent = ({ id, detailEvent, auth }) => async (dispatch) => {
  try {
    const exists = detailEvent.find(ev => ev._id === id);
    if (!exists) {
      const res = await getDataAPI(`event/${id}`, auth.token);
      dispatch({ type: EVENT_TYPES.GET_EVENT, payload: res.data.event });
    }
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Failed to fetch event' }
    });
  }
};

export const updateEvent = ({ id, data, images, auth }) => async (dispatch) => {
  try {
    let media = [];

    const newImages = images.filter(img => !img.url); // local files
    const oldImages = images.filter(img => img.url);  // existing images
  
    if (newImages.length > 0) {
      media = await imageUpload(newImages, auth.token);
    }

    const payload = {
      ...data,
      images: [...oldImages, ...media],
    };

    const res = await patchDataAPI(`event/${id}`, payload, auth.token);

    dispatch({ type: EVENT_TYPES.UPDATE_EVENT, payload: res.data.updatedEvent })

    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Update failed' }
    })
  }
}

export const deleteEvent = ({ id, auth }) => async (dispatch) => {
  try {
    await deleteDataAPI(`event/${id}`, auth.token)
    dispatch({ type: EVENT_TYPES.DELETE_EVENT, payload: id })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Delete failed' }
    })
  }
}