import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../Avatar';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { useTranslation } from 'react-i18next';

const Status = () => {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div className="status my-3 d-flex">
      <Avatar src={auth.user.avatar} size="big-avatar" marginRight={5} />

      <button
        className="statusBtn flex-fill"
        onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: true })}
      >
        {t('thinking_placeholder', { username: auth.user.username })}
      </button>
    </div>
  );
};

export default Status;