import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { NOTIFY_TYPES, getNotifies, isReadNotify } from '../redux/actions/notifyAction';
import Avatar from './Avatar';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const NotifyModal = ({ onClose = () => {} }) => {
  const { t } = useTranslation();

  const auth = useSelector(state => state.auth);
  const notify = useSelector(state => state.notify);
  const dispatch = useDispatch();

  const scrollRef = useRef();

  const handleIsRead = (msg) => {
    dispatch(isReadNotify({ msg, auth }));
  };

  const handleSound = () => {
    dispatch({ type: NOTIFY_TYPES.UPDATE_SOUND, payload: !notify.sound });
  };

  useEffect(() => {
    if (notify.page === 1 && notify.data.length === 0) {
      dispatch(getNotifies(auth.token, 1));
    }
  }, [dispatch, auth.token, notify.page, notify.data.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (
      el.scrollTop + el.clientHeight >= el.scrollHeight - 300 &&
      notify.data.length < notify.total
    ) {
      dispatch(getNotifies(auth.token, notify.page + 1));
    }
  }, [dispatch, auth.token, notify.data.length, notify.page, notify.total]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div style={{ minWidth: '300px' }}>
      <div
        className="d-flex align-items-center justify-content-between px-3 mb-2"
        style={{ position: 'relative' }}
      >
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

      <div
        ref={scrollRef}
        style={{ height: 'calc(100vh - 130px)', overflow: 'auto' }}
      >
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
            <div key={msg._id || index} className="px-2 mb-3">
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
    </div>
  );
};

export default NotifyModal;