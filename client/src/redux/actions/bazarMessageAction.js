import { getDataAPI, postDataAPI, deleteDataAPI } from '../../utils/fetchData';
import { GLOBALTYPES, DeleteData } from './globalTypes';

export const BAZAR_MSG_TYPES = {
  GET_BAZAR_CONVERSATIONS: 'GET_BAZAR_CONVERSATIONS',
  ADD_BAZAR_CONVERSATION: 'ADD_BAZAR_CONVERSATION',
  GET_BAZAR_MESSAGES: 'GET_BAZAR_MESSAGES',
  UPDATE_BAZAR_MESSAGES: 'UPDATE_BAZAR_MESSAGES',
  ADD_BAZAR_MESSAGE: 'ADD_BAZAR_MESSAGE',
  DELETE_BAZAR_MESSAGES: 'DELETE_BAZAR_MESSAGES',
  DELETE_BAZAR_CONVERSATION: 'DELETE_BAZAR_CONVERSATION',
};

export const getBazarConversations = () => async (dispatch, getState) => {
  const { auth } = getState();
  try {
    const res = await getDataAPI('bazar-conversations', auth.token);
    const newArr = res.data.conversations.map(item => {
      const otherUser = item.recipients.find(u => u._id !== auth.user._id);
      return {
        ...otherUser,
        text: '',
        media: [],
        item: item.item,
        _id: item._id
      };
    });

    dispatch({
      type: BAZAR_MSG_TYPES.GET_BAZAR_CONVERSATIONS,
      payload: { newArr, result: res.data.result }
    });
  } catch (err) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg } });
  }
};

export const startBazarConversation = (itemId) => async (dispatch, getState) => {
  const { auth } = getState();
  try {
    const res = await postDataAPI(`bazar-messages/start/${itemId}`, null, auth.token);
    dispatch({ type: BAZAR_MSG_TYPES.ADD_BAZAR_CONVERSATION, payload: res.data.conversation });
    return res.data.conversation;
  } catch (err) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg } });
  }
};

export const getBazarMessages = ({ auth, id, page = 1 }) => async dispatch => {
  try {
    const res = await getDataAPI(`bazar-message/${id}?limit=${page * 9}`, auth.token);
    const newData = { ...res.data, messages: res.data.messages.reverse() };

    dispatch({
      type: BAZAR_MSG_TYPES.GET_BAZAR_MESSAGES,
      payload: { ...newData, _id: id, page }
    });
  } catch (err) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg } });
  }
};

export const loadMoreBazarMessages = ({ convId, page = 1 }) => async (dispatch, getState) => {
  const { auth } = getState();
  try {
    const res = await getDataAPI(`bazar-message/${convId}?limit=${page * 9}`, auth.token);
    const newMessages = res.data.messages.reverse();

    dispatch({
      type: BAZAR_MSG_TYPES.UPDATE_BAZAR_MESSAGES,
      payload: {
        _id: convId,
        messages: newMessages,
        page,
        result: newMessages.length
      }
    });
  } catch (err) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg } });
  }
};

export const sendBazarMessage = ({ msg, auth, socket }) => async dispatch => {
  dispatch({ type: BAZAR_MSG_TYPES.ADD_BAZAR_MESSAGE, payload: msg });

  const { _id, avatar, fullname, username } = auth.user;
  socket.emit('addBazarMessage', { ...msg, user: { _id, avatar, fullname, username } });

  try {
    const res = await postDataAPI(`bazar-message`, msg, auth.token);
    const realMsg = res.data.message;

    dispatch({
      type: BAZAR_MSG_TYPES.UPDATE_BAZAR_MESSAGES,
      payload: {
        _id: msg.conversation,
        messages: [{ ...msg, _id: realMsg._id }],
        page: 1,
        result: 1
      }
    });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg }
    });
  }
};

export const deleteBazarMessage = ({ msg, data, auth }) => async dispatch => {
  const newData = DeleteData(data, msg._id);

  dispatch({
    type: BAZAR_MSG_TYPES.DELETE_BAZAR_MESSAGES,
    payload: { newData, _id: msg.conversation }
  });

  try {
    await deleteDataAPI(`bazar-message/${msg._id}`, auth.token);
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg }
    });
  }
};

export const deleteBazarConversation = ({ auth, convId, navigate }) => async (dispatch) => {
  dispatch({ type: BAZAR_MSG_TYPES.DELETE_BAZAR_CONVERSATION, payload: convId });

  try {
    await deleteDataAPI(`bazar-conversation/${convId}`, auth.token);
    navigate('/message/sub/bazar');
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg }
    });
  }
};