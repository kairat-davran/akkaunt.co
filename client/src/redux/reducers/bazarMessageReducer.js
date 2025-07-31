import { BAZAR_MSG_TYPES } from '../actions/bazarMessageAction';
import { DeleteData } from '../actions/globalTypes';

const initialState = {
  users: [],
  resultUsers: 0,
  data: [],
  firstLoad: false
};

const bazarMessageReducer = (state = initialState, action) => {
  switch (action.type) {
    case BAZAR_MSG_TYPES.ADD_BAZAR_CONVERSATION:
      if (state.users.every(u => u._id !== action.payload._id)) {
        return {
          ...state,
          users: [action.payload, ...state.users]
        };
      }
      return state;

    case BAZAR_MSG_TYPES.GET_BAZAR_CONVERSATIONS:
      return {
        ...state,
        users: action.payload.newArr,
        resultUsers: action.payload.result,
        firstLoad: true
      };

    case BAZAR_MSG_TYPES.ADD_BAZAR_MESSAGE:
      return {
        ...state,
        data: state.data.map(item =>
          item._id === action.payload.conversation
            ? {
                ...item,
                messages: [...item.messages, action.payload],
                result: item.result + 1
              }
            : item
        ),
        users: state.users.map(user =>
          user._id === action.payload.conversation
            ? {
                ...user,
                text: action.payload.text,
                media: action.payload.media,
                call: action.payload.call
              }
            : user
        )
      };

    case BAZAR_MSG_TYPES.GET_BAZAR_MESSAGES:
      return {
        ...state,
        data: [...state.data, action.payload]
      };

    case BAZAR_MSG_TYPES.UPDATE_BAZAR_MESSAGES:
      return {
        ...state,
        data: state.data.map(item =>
          item._id === action.payload._id
            ? {
                ...item,
                messages: item.messages.map(msg =>
                  !msg._id && msg.createdAt === action.payload.messages[0].createdAt
                    ? { ...msg, _id: action.payload.messages[0]._id }
                    : msg
                )
              }
            : item
        )
      };

    case BAZAR_MSG_TYPES.DELETE_BAZAR_MESSAGES:
      return {
        ...state,
        data: state.data.map(item =>
          item._id === action.payload._id
            ? { ...item, messages: action.payload.newData }
            : item
        )
      };

    case BAZAR_MSG_TYPES.DELETE_BAZAR_CONVERSATION:
      return {
        ...state,
        users: DeleteData(state.users, action.payload),
        data: DeleteData(state.data, action.payload)
      };

    default:
      return state;
  }
};

export default bazarMessageReducer;