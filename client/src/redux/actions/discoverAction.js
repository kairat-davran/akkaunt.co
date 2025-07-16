import { GLOBALTYPES } from './globalTypes'
import { getDataAPI } from '../../utils/fetchData'

export const DISCOVER_TYPES = {
    LOADING: 'LOADING_DISCOVER',
    GET_POSTS: 'GET_DISCOVER_POSTS',
    UPDATE_POST: 'UPDATE_DISCOVER_POST'
}

export const getDiscoverPosts = (token, page = 1) => async (dispatch) => {
  try {
    dispatch({ type: DISCOVER_TYPES.LOADING, payload: true });

    const res = await getDataAPI(`post_discover?page=${page}&limit=10`, token);

    dispatch({
      type: page === 1 ? DISCOVER_TYPES.GET_POSTS : DISCOVER_TYPES.UPDATE_POST,
      payload: res.data
    });

    dispatch({ type: DISCOVER_TYPES.LOADING, payload: false });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg }
    });
  }
};