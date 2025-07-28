import { getDataAPI, postDataAPI, deleteDataAPI } from '../../utils/fetchData';
import { DeleteData, GLOBALTYPES } from './globalTypes';

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
    const res = await getDataAPI('bazar-messages/conversations', auth.token);
    let newArr = [];
    res.data.conversations.forEach(item => {
      const otherUser = item.participants.find(p => p._id !== auth.user._id);
      if (otherUser) {
        newArr.push({
          ...otherUser,
          text: item.lastMessage?.text || '',
          media: item.lastMessage?.media || [],
          item: item.item,
          _id: item._id
        });
      }
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
    const res = await getDataAPI(`bazar-messages/${id}?limit=${page * 9}`, auth.token);
    const newData = { ...res.data, messages: res.data.messages };

    dispatch({
      type: BAZAR_MSG_TYPES.GET_BAZAR_MESSAGES,
      payload: { ...newData, _id: id, page }
    });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg }
    });
  }
};

export const loadMoreBazarMessages = ({ convId, page = 1 }) => async (dispatch, getState) => {
  const { auth } = getState();
  try {
    const res = await getDataAPI(`bazar-messages/${convId}?limit=${page * 9}`, auth.token);
    const newMessages = res.data.messages;

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

  try {
    const res = await postDataAPI(`bazar-messages/send/${msg.conversation}`, msg, auth.token);
    const realMsg = res.data.message;

    dispatch({
      type: BAZAR_MSG_TYPES.UPDATE_BAZAR_MESSAGES,
      payload: {
        _id: msg.recipient,
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

export const deleteBazarMessage = ({ msg, data, auth }) => async (dispatch) => {
  const newData = DeleteData(data, msg._id);

  dispatch({type: BAZAR_MSG_TYPES.DELETE_BAZAR_MESSAGES, payload: { newData, _id: msg.conversation}});

  try {
    await deleteDataAPI(`bazar-messages/message/${msg._id}`, auth.token);
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg }
    });
  }
};

export const deleteBazarConversation = (convId) => async (dispatch, getState) => {
  const { auth } = getState();

  dispatch({ type: BAZAR_MSG_TYPES.DELETE_BAZAR_CONVERSATION, payload: convId });

  try {
    await deleteDataAPI(`bazar-messages/conversation/${convId}`, auth.token);
  } catch (err) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg } });
  }
};