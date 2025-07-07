import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../redux/actions/authAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import Avatar from '../Avatar';
import NotifyModal from '../NotifyModal';
import SearchSide from './SearchSide';

const MenuSide = () => {
  const navLinks = [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Message', icon: 'near_me', path: '/message' },
    { label: 'Discover', icon: 'explore', path: '/discover' },
    { label: 'Events', icon: 'event', path: '/events' },
    { label: 'Bazar', icon: 'storefront', path: '/bazar' },
  ];

  const auth = useSelector(state => state.auth);
  const theme = useSelector(state => state.theme);
  const notify = useSelector(state => state.notify);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const [openSearch, setOpenSearch] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);

  const searchRef = useRef();
  const notifyRef = useRef();

  const isActive = (pn) => (pn === pathname ? 'active' : '');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpenSearch(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setOpenNotify(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {navLinks.map((link, index) => (
        <Link key={index} to={link.path} className={`nav-link ${isActive(link.path)}`}>
          <span className="material-icons">{link.icon}</span>
          <span className="label">{link.label}</span>
        </Link>
      ))}

      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setOpenSearch(!openSearch);
          setOpenNotify(false);
        }}
        className={`nav-link ${openSearch ? 'active' : ''}`}
      >
        <span className="material-icons">search</span>
        <span className="label">Search</span>
      </Link>

      {/* Notifications Toggle */}
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setOpenNotify(!openNotify);
          setOpenSearch(false);
        }}
        className={`nav-link notify ${openNotify ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        <span
          className="material-icons"
          style={{ color: notify.data.length > 0 ? 'crimson' : '' }}
        >
          favorite
        </span>
        <span className="label">Notifications</span>
        {notify.data.length > 0 && (
          <span className="notify_length">{notify.data.length}</span>
        )}
      </Link>

      {/* Avatar dropdown */}
      <div className="nav-link avatar-dropdown dropdown">
        <Avatar src={auth.user.avatar} size="medium-avatar" />
        <span className="label">Profile</span>
        <div className="dropdown-content">
          <Link to={`/profile/${auth.user._id}`}>Profile</Link>
          <div
            onClick={() => dispatch({ type: GLOBALTYPES.THEME, payload: !theme })}
            style={{ cursor: 'pointer', padding: '5px 0' }}
          >
            {theme ? 'Light mode' : 'Dark mode'}
          </div>
          <div className="dropdown-divider" />
          <div
            onClick={() => dispatch(logout())}
            style={{ cursor: 'pointer', padding: '5px 0' }}
          >
            Logout
          </div>
        </div>
      </div>

      {/* 🔲 Sliding Panels */}
      {openSearch && (
        <div className="search-dropdown" ref={searchRef}>
          <SearchSide />
        </div>
      )}
      {openNotify && (
        <div className="search-dropdown" ref={notifyRef}>
          <NotifyModal />
        </div>
      )}
    </>
  );
};

export default MenuSide;