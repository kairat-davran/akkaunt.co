import { DeleteData, EditData } from '../actions/globalTypes';
import { POST_TYPES } from '../actions/postAction';

const initialState = {
  loading: false,
  posts: [],
  result: 0,
  page: 2,
  saved: [],
  savedResult: 0,
  savedPage: 1
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case POST_TYPES.CREATE_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts]
      };
    case POST_TYPES.LOADING_POST:
      return {
        ...state,
        loading: action.payload
      };
    case POST_TYPES.GET_POSTS:
      return {
        ...state,
        posts: action.payload.posts,
        result: action.payload.result,
        page: action.payload.page
      };
    case POST_TYPES.UPDATE_POST:
      return {
        ...state,
        posts: EditData(state.posts, action.payload._id, action.payload),
        saved: EditData(state.saved, action.payload._id, action.payload)
      };
    case POST_TYPES.DELETE_POST:
      return {
        ...state,
        posts: DeleteData(state.posts, action.payload._id),
        saved: DeleteData(state.saved, action.payload._id)
      };
    case POST_TYPES.GET_SAVED_POSTS:
      return {
        ...state,
        saved: [...state.saved, ...action.payload.posts],
        savedResult: action.payload.result,
        savedPage: action.payload.page
      };
    default:
      return state;
  }
};

export default postReducer;