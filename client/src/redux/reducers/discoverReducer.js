import { DISCOVER_TYPES } from '../actions/discoverAction'

const initialState = {
    loading: false,
    posts: [],
    result: 10,
    page: 1,
    firstLoad: false
}

const discoverReducer = (state = initialState, action) => {
    switch (action.type){
        case DISCOVER_TYPES.LOADING:
            return {
                ...state,
                loading: action.payload
            };
        case DISCOVER_TYPES.GET_POSTS:
            return {
                ...state,
                posts: action.payload.posts,
                result: action.payload.result,
                page: 2,
                firstLoad: true
            };
        case DISCOVER_TYPES.UPDATE_POST:
            return {
                ...state,
                posts: [...state.posts, ...action.payload.posts],
                result: action.payload.result,
                page: state.page + 1
            };
        default:
            return state;
    }
}

export default discoverReducer