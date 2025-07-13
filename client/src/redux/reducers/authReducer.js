import { GLOBALTYPES } from "../actions/globalTypes";

const initialState = {
  token: '',
  user: {
    _id: '',
    username: '',
    fullname: '',
    email: '',
    avatar: '',
    role: 'user',
    seller: {
      isTrusted: false,
      listingCount: 0,
      sellerSince: '',
      rating: 0,
      reviews: 0,
      lockedReason: '',
      lockedAt: null
    }
  }
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case GLOBALTYPES.AUTH:
      return {
        ...state,
        ...action.payload,
        user: {
          ...state.user,
          ...action.payload.user
        }
      };

    case GLOBALTYPES.LOGOUT:
      return initialState;

    default:
      return state;
  }
};

export default authReducer;