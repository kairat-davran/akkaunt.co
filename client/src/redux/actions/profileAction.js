import { getDataAPI, patchDataAPI } from "../../utils/fetchData"
import { imageUpload } from "../../utils/imageUpload"
import { DeleteData, GLOBALTYPES } from "./globalTypes"
import { createNotify, removeNotify } from "./notifyAction"

export const PROFILE_TYPES = {
    LOADING: 'LOADING',
    GET_USER: 'GET_PROFILE_USER',
    GET_USERS_BY_SEARCH: 'GET_USERS_BY_SEARCH',
    FOLLOW: 'FOLLOW',
    UNFOLLOW: 'UNFOLLOW',
    GET_ID: 'GET_PROFILE_ID',
    GET_POSTS: 'GET_PROFILE_POSTS',
    UPDATE_POST: 'UPDATE_PROFILE_POST'
}

export const toggleTheme = (auth, currentTheme) => async (dispatch) => {
  const newTheme = !currentTheme;

  dispatch({ type: GLOBALTYPES.THEME, payload: newTheme });

  dispatch({
    type: GLOBALTYPES.AUTH,
    payload: {
      ...auth,
      user: {
        ...auth.user,
        theme: newTheme
      }
    }
  });

  try {
    await patchDataAPI("user/theme", { theme: newTheme }, auth.token);
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || "Failed to update theme" }
    });
  }
};

export const getProfileUsers = ({id, auth}) => async (dispatch) => {
    dispatch({type: PROFILE_TYPES.GET_ID, payload: id})

    try {
        const res = getDataAPI(`/user/${id}`, auth.token)
        const res1 = getDataAPI(`/user_posts/${id}`, auth.token)
        
        const users = await res;
        const posts = await res1;

        dispatch({
            type: PROFILE_TYPES.GET_USER,
            payload: users.data
        })

        dispatch({
            type: PROFILE_TYPES.GET_POSTS,
            payload: {...posts.data, _id: id, page: 2}
        })

    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response.data.msg}
        })
    }
}

export const getUsers = (token, search = '') => async (dispatch) => {
  if (!search.trim()) {
    return dispatch({
      type: PROFILE_TYPES.GET_USERS_BY_SEARCH,
      payload: []
    });
  }

  try {
    const query = new URLSearchParams();
    if (search) query.append('search', search);

    const res = await getDataAPI(`users?${query.toString()}`, token);

    dispatch({
      type: PROFILE_TYPES.GET_USERS_BY_SEARCH,
      payload: res.data.users
    });

  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || 'Failed to search users'
      }
    });
  }
};

export const updateProfileUser = ({userData, avatar, auth}) => async (dispatch) => {
    if(!userData.fullname)
    return dispatch({type: GLOBALTYPES.ALERT, payload: { error: "Please add your full name." }})

    if(userData.fullname.length > 25)
    return dispatch({type: GLOBALTYPES.ALERT, payload: { error: "Your full name is too long." }})

    if(userData.story > 200)
    return dispatch({type: GLOBALTYPES.ALERT, payload: { error: "Your story is too long." }})

    try {
        let media;
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})

        if(avatar) media = await imageUpload([avatar], auth.token)

        const res = await patchDataAPI("user", {
            ...userData,
            avatar: avatar ? media[0].url : auth.user.avatar
        }, auth.token)

        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: {
                ...auth,
                user: {
                    ...auth.user, ...userData,
                    avatar: avatar ? media[0].url : auth.user.avatar
                }
            }
        })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response.data.msg}})
    }
}

export const follow = ({users, user, auth, socket}) => async (dispatch) => {
    let newUser;
    if(users.every(item => item._id !== user._id)) {
        newUser = {...user, followers: [...user.followers, auth.user]}
    }else{
        users.forEach(item => {
            if(item._id === user._id) {
                newUser = {...item, followers: [...item.followers, auth.user]}
            }
        })
    }

    dispatch({ type: PROFILE_TYPES.FOLLOW, payload: newUser })

    dispatch({
        type: GLOBALTYPES.AUTH,
        payload: {
            ...auth,
            user: {...auth.user, following: [...auth.user.following, newUser]}
        }
    })

    try {
        const res = await patchDataAPI(`user/${user._id}/follow`, null, auth.token)
        socket.emit('follow', res.data.newUser)

        const msg = {
            id: auth.user._id,
            text: 'has started to follow you.',
            recipients: [newUser._id],
            url: `/profile/id/${auth.user._id}`,
        }

        dispatch(createNotify({msg, auth, socket}))

    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: {error: err.response.data.msg}
        })
    }
}

export const unfollow = ({users, user, auth, socket}) => async (dispatch) => {
    let newUser;
    if(users.every(item => item._id !== user._id)) {
        newUser = {...user, followers: DeleteData(user.followers, auth.user._id)}
    }else{
        users.forEach(item => {
            if(item._id === user._id) {
                newUser = {...item, followers: DeleteData(item.followers, auth.user._id)}
            }
        })
    }

    dispatch({ type: PROFILE_TYPES.UNFOLLOW, payload: newUser })

    dispatch({
        type: GLOBALTYPES.AUTH,
        payload: {
            ...auth,
            user: {
                ...auth.user, following: DeleteData(auth.user.following, newUser._id)
            }
        }
    })

    try {
        const res = await patchDataAPI(`user/${user._id}/unfollow`, null, auth.token)
        socket.emit('unFollow', res.data.newUser)

        // Notify
        const msg = {
            id: auth.user._id,
            text: 'has started to follow you.',
            recipients: [newUser._id],
            url: `/profile/${auth.user._id}`,
        }

        dispatch(removeNotify({msg, auth, socket}))
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response.data.msg}
        })
    }
}