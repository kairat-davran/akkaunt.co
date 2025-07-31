import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { NOTIFY_TYPES, deleteAllNotifies, isReadNotify } from '../redux/actions/notifyAction';
import Avatar from './Avatar';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const NotifyModal = ({ onClose = () => {} }) => {
  const { t } = useTranslation();

  const auth = useSelector(state => state.auth);
  const notify = useSelector(state => state.notify);
  const dispatch = useDispatch();

  const handleIsRead = (msg) => {
    dispatch(isReadNotify({ msg, auth }));
  };

  const handleSound = () => {
    dispatch({ type: NOTIFY_TYPES.UPDATE_SOUND, payload: !notify.sound });
  };

  const handleDeleteAll = () => {
    const newArr = notify.data.filter(item => item.isRead === false);
    if (newArr.length === 0) return dispatch(deleteAllNotifies(auth.token));

    if (window.confirm(t('confirm_delete_all', { count: newArr.length }))) {
      return dispatch(deleteAllNotifies(auth.token));
    }
  };

  return (
    <div style={{ minWidth: '300px' }}>
      <div className="d-flex align-items-center justify-content-between px-3 mb-2" style={{ position: 'relative' }}>
        <div style={{ width: '32px' }}>
          {typeof onClose === 'function' && window.innerWidth <= 768 && (
            <span className="dm-back-btn" onClick={onClose}>
              <i className="fas fa-arrow-left"></i>
            </span>
          )}
        </div>

        <h3 className="m-0 text-center flex-grow-1">{t('notifications')}</h3>

        <div style={{ width: '32px', textAlign: 'right' }}>
          {notify.sound ? (
            <i
              className="fas fa-bell text-danger"
              style={{ fontSize: '1.2rem', cursor: 'pointer' }}
              onClick={handleSound}
            />
          ) : (
            <i
              className="fas fa-bell-slash text-danger"
              style={{ fontSize: '1.2rem', cursor: 'pointer' }}
              onClick={handleSound}
            />
          )}
        </div>
      </div>
      <hr className="mt-0" />

      <div style={{ height: 'calc(100vh - 130px)', overflow: 'auto' }}>
        {notify.data.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '40px 10px' }}>
            <span className="material-icons" style={{ fontSize: '80px', opacity: 0.5 }}>
              notifications_off
            </span>
            <h5>{t('all_caught_up')}</h5>
            <p style={{ fontSize: '14px', maxWidth: '240px', margin: 'auto' }}>
              {t('no_notifications')}
            </p>
          </div>
        ) : (
          notify.data.map((msg, index) => (
            <div key={index} className="px-2 mb-3">
              <Link
                to={`${msg.url}`}
                className="d-flex text-dark align-items-center"
                onClick={() => handleIsRead(msg)}
              >
                <Avatar src={msg.user.avatar} size="big-avatar" />
                <div className="mx-1 flex-fill">
                  <div>
                    <strong className="mr-1">{msg.user.username}</strong>
                    <span>{msg.text}</span>
                  </div>
                  {msg.content && <small>{msg.content.slice(0, 20)}...</small>}
                </div>

                {msg.image && (
                  <div style={{ width: '30px' }}>
                    {msg.image.match(/video/i) ? (
                      <video src={msg.image} width="100%" />
                    ) : (
                      <Avatar src={msg.image} size="medium-avatar" />
                    )}
                  </div>
                )}
              </Link>
              <small className="text-muted d-flex justify-content-between px-2">
                {moment(msg.createdAt).fromNow()}
                {!msg.isRead && <i className="fas fa-circle text-primary" />}
              </small>
            </div>
          ))
        )}
      </div>

      <hr className="my-1" />
      <div className="text-right text-danger mr-2" style={{ cursor: 'pointer' }} onClick={handleDeleteAll}>
        {t('delete_all')}
      </div>
    </div>
  );
};

export default NotifyModal;
