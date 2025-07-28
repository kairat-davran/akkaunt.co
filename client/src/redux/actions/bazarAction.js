import { GLOBALTYPES } from './globalTypes';
import {
  getDataAPI,
  postDataAPI,
  deleteDataAPI,
  patchDataAPI
} from '../../utils/fetchData';
import { imageUpload } from '../../utils/imageUpload';

export const BAZAR_TYPES = {
  CREATE_ITEM: 'CREATE_ITEM',
  GET_ITEMS: 'GET_ITEMS',
  GET_ITEM_DETAIL: 'GET_ITEM_DETAIL',
  GET_ITEMS_BY_SELLER: 'GET_ITEMS_BY_SELLER',
  UPDATE_ITEM: 'UPDATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  LOADING_ITEM: 'LOADING_ITEM',
  SAVE_ITEM: 'SAVE_BAZAR_ITEM',
  UNSAVE_ITEM: 'UNSAVE_BAZAR_ITEM',
  SET_SAVED_ITEMS: 'SET_SAVED_BAZAR_ITEMS',
};

// Create Item
export const createItem = ({ data, images, auth }) => async (dispatch) => {
  let media = [];

  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    if (images.length > 0) {
      media = await imageUpload(images, auth.token);
    }

    const payload = { ...data, images: media };
    const res = await postDataAPI('bazar', payload, auth.token);

    dispatch({ type: BAZAR_TYPES.CREATE_ITEM, payload: res.data.newItem });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });

    return true; // ✅ success
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Item creation failed',
      },
    });
    return false; // ❌ failure
  }
};

// Get Items (with optional search and category)
export const getItems = (token, search = '', category = '') => async (dispatch) => {
  try {
    dispatch({ type: BAZAR_TYPES.LOADING_ITEM, payload: true });

    // Build query string
    const query = new URLSearchParams();
    if (search.trim()) query.append('search', search.trim());
    if (category && category !== 'All') query.append('category', category);

    const url = query.toString() ? `bazar?${query.toString()}` : 'bazar';

    const res = await getDataAPI(url, token);

    dispatch({ type: BAZAR_TYPES.GET_ITEMS, payload: res.data });
    dispatch({ type: BAZAR_TYPES.LOADING_ITEM, payload: false });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Failed to load items',
      },
    });
  }
};

export const getItemsBySeller = (sellerId, token) => async (dispatch) => {
  try {
    dispatch({ type: BAZAR_TYPES.LOADING_ITEM, payload: true });

    const res = await getDataAPI(`bazar/seller/${sellerId}`, token);

    dispatch({
      type: BAZAR_TYPES.GET_ITEMS_BY_SELLER,
      payload: {
        seller: res.data.seller,
        items: res.data.items
      }
    });

    dispatch({ type: BAZAR_TYPES.LOADING_ITEM, payload: false });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Failed to load seller items',
      },
    });
  }
};

export const getItemById = (id, token) => async (dispatch) => {
  try {
    dispatch({ type: BAZAR_TYPES.LOADING_ITEM, payload: true });

    const res = await getDataAPI(`bazar/${id}`, token);

    dispatch({
      type: BAZAR_TYPES.GET_ITEM_DETAIL,
      payload: res.data.item, // make sure backend returns { item }
    });

    dispatch({ type: BAZAR_TYPES.LOADING_ITEM, payload: false });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Failed to load item detail',
      },
    });
  }
};

// Update Item
export const updateItem = ({ data, images, auth }) => async (dispatch) => {
  let media = [];
  
  try {

    if (images.length > 0) {
      media = await imageUpload(images, auth.token);
    }

    const res = await patchDataAPI(`bazar/${data.id}`, {
      ...data,
      images: media.filter(Boolean),
    }, auth.token);

    dispatch({ type: BAZAR_TYPES.UPDATE_ITEM, payload: res.data.updatedItem });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Update failed',
      },
    });
  }
};

// Delete Item
export const deleteItem = ({ id, auth }) => async (dispatch) => {
  try {
    await deleteDataAPI(`bazar/${id}`, auth.token);
    dispatch({ type: BAZAR_TYPES.DELETE_ITEM, payload: id });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Delete failed',
      },
    });
  }
};

// Save Item
export const saveItem = (item, auth) => async (dispatch) => {
  try {
    await patchDataAPI(`bazar/save/${item._id}`, null, auth.token);
    dispatch({ type: BAZAR_TYPES.SAVE_ITEM, payload: item });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Save failed',
      },
    });
  }
};

// Unsave Item
export const unsaveItem = (item, auth) => async (dispatch) => {
  try {
    await patchDataAPI(`bazar/unsave/${item._id}`, null, auth.token);
    dispatch({ type: BAZAR_TYPES.UNSAVE_ITEM, payload: item._id });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Unsave failed',
      },
    });
  }
};

// Get all saved items
export const getSavedItems = (token) => async (dispatch) => {
  try {
    const res = await getDataAPI('bazar/saved', token);
    dispatch({
      type: BAZAR_TYPES.SET_SAVED_ITEMS,
      payload: res.data.items,
    });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Failed to load saved items',
      },
    });
  }
};