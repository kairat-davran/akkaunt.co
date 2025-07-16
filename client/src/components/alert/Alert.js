import React from 'react';
import Loading from './Loading';
import { useDispatch, useSelector } from 'react-redux';
import Toast from './Toast';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';

function Alert() {
  const alert = useSelector(state => state.alert);
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const shouldShowAlertLoading = alert.loading && auth.token;

  return (
    <div>
      {shouldShowAlertLoading && <Loading />}

      {alert.error && (
        <Toast
          msg={{ title: 'Error', body: alert.error }}
          handleShow={() => dispatch({ type: GLOBALTYPES.ALERT, payload: {} })}
          bgColor="bg-danger"
        />
      )}

      {alert.success && (
        <Toast
          msg={{ title: 'Success', body: alert.success }}
          handleShow={() => dispatch({ type: GLOBALTYPES.ALERT, payload: {} })}
          bgColor="bg-success"
        />
      )}
    </div>
  );
}

export default Alert;