import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import NotifyModal from '../NotifyModal';
import { getUsers } from '../../redux/actions/profileAction';
import UserCard from '../UserCard';

const MobileTopBar = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { users } = useSelector(state => state.profile);
  const auth = useSelector(state => state.auth)
  const notify = useSelector(state => state.notify);

  const [openNotify, setOpenNotify] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const notifyRef = useRef();

  const isActive = (pn) => (pn === pathname ? 'active' : '');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setOpenNotify(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      dispatch(getUsers(auth.token, searchKeyword.trim()));
    }
  }, [dispatch, auth.token, searchKeyword]);

  const handleClose = () => {
    setSearchKeyword('');
    dispatch(getUsers(auth.token, ''));
  }

  useEffect(() => {
    setOpenNotify(false);
  }, [pathname]);

  return (
    <div className="mobile-topbar" style={{ display: pathname === '/discover' ? 'block' : 'flex' }}>
      {pathname === '/' && (
        <>
          <div className="topbar-left">
            <Link to="/" onClick={() => window.scrollTo({ top: 0 })}>
              <h1 className="logo">αккαυηт</h1>
            </Link>
          </div>

          <div className="topbar-right">
            <Link to="/message" className={`nav-link ${isActive('/message')}`}>
              <span className="material-icons">near_me</span>
            </Link>

            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setOpenNotify(!openNotify);
              }}
              className={`nav-link ${openNotify ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <span
                className="material-icons"
                style={{ color: notify.data.some(n => !n.isRead) ? 'crimson' : '' }}
              >
                favorite
              </span>
              {notify.data.filter(n => !n.isRead).length > 0 && (
                <span className="notify_length">
                  {notify.data.filter(n => !n.isRead).length}
                </span>
              )}
            </Link>
          </div>
        </>
      )}

      {pathname === '/discover' && (
        <form className="search-panel">
          <input
            type="text"
            name="search"
            value={searchKeyword}
            id="search"
            className="search-panel__input"
            title="Enter to Search"
            onChange={e => setSearchKeyword(e.target.value.toLowerCase().replace(/ /g, ''))}
          />

          <div className="search-panel__icon" style={{ opacity: searchKeyword ? 0 : 0.3 }}>
            <span className="material-icons">search</span>
            <span>Enter to Search</span>
          </div>

          <div
            className="search-panel__close"
            onClick={handleClose}
            style={{ opacity: users.length === 0 ? 0 : 1 }}
          >
            &times;
          </div>

          <div className="search-panel__results">
            {searchKeyword && users.map(user => (
              <UserCard
                key={user._id}
                user={user}
                border="border"
                handleClose={handleClose}
              />
            ))}
          </div>
        </form>
      )}

      {openNotify && (
        <div className="search-dropdown" ref={notifyRef}>
          <NotifyModal onClose={() => setOpenNotify(false)} />
        </div>
      )}
    </div>
  );
};

export default MobileTopBar;