import { postDataAPI } from "../../utils/fetchData";
import valid from "../../utils/valid";
import { GLOBALTYPES } from "./globalTypes";

export const precheckRegister = (data) => async (dispatch) => {
  const check = valid(data);
  if (check.errLength > 0) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: check.errMsg });
    return false;
  }

  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    await postDataAPI("precheck-register", data);

    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: "One more step, please" }
    });

    return true;
  } catch (err) {
    const response = err.response?.data;
    if (response?.errors) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: response.errors }
      });
    } else {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: response?.msg || "Precheck failed" }
      });
    }

    return false;
  }
};

export const login = (data) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    const res = await postDataAPI("login", data);

    dispatch({
      type: GLOBALTYPES.AUTH,
      payload: {
        token: res.data.access_token,
        user: res.data.user
      }
    });

    dispatch({
      type: GLOBALTYPES.THEME,
      payload: res.data.user.theme
    });

    localStorage.setItem("firstLogin", true);

    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        success: res.data.msg
      }
    });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || "Login failed"
      }
    });
  }
};

export const refreshToken = () => async (dispatch) => {
  const firstLogin = localStorage.getItem("firstLogin");

  if (firstLogin) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    try {
      const res = await postDataAPI("refresh_token");

      dispatch({
        type: GLOBALTYPES.AUTH,
        payload: {
          token: res.data.access_token,
          user: res.data.user
        }
      });

      dispatch({
        type: GLOBALTYPES.THEME,
        payload: res.data.user.theme
      });

      dispatch({ type: GLOBALTYPES.ALERT, payload: {} });

    } catch (err) {
      dispatch({ type: GLOBALTYPES.AUTH, payload: {} });
      dispatch({ type: GLOBALTYPES.THEME, payload: false });

      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: {
          error: "Session expired. Please log in again."
        }
      });

      // localStorage.removeItem("firstLogin");
    }
  }
};

export const register = (data) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    const res = await postDataAPI("register", data);

    dispatch({
      type: GLOBALTYPES.AUTH,
      payload: {
        token: res.data.access_token,
        user: res.data.user
      }
    });

    dispatch({
      type: GLOBALTYPES.THEME,
      payload: res.data.user.theme
    });

    localStorage.setItem("firstLogin", true);

    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        success: res.data.msg
      }
    });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || "Registration failed"
      }
    });
  }
};

export const logout = () => async (dispatch) => {
  try {
    localStorage.removeItem("firstLogin");
    await postDataAPI("logout");
    window.location.href = "/";
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: {
        error: err.response?.data?.msg || "Logout failed"
      }
    });
  }
};