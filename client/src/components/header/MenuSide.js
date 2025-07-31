import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Avatar from '../Avatar';
import NotifyModal from '../NotifyModal';
import SearchSide from './SearchSide';
import { useTranslation } from 'react-i18next';

const MenuSide = () => {
  const { t } = useTranslation();

  const navLinks = [
    { label: t('home'), icon: 'home', path: '/' },
    { label: t('discover'), icon: 'explore', path: '/discover' },
    { label: t('events'), icon: 'event', path: '/events' },
    { label: t('bazar'), icon: 'storefront', path: '/bazar' }
  ];

  const auth = useSelector(state => state.auth);
  const notify = useSelector(state => state.notify);
  const { pathname } = useLocation();

  const [openSearch, setOpenSearch] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const searchRef = useRef();
  const notifyRef = useRef();

  const isActive = (pn) => (pn === pathname ? 'active' : '');

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

    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = screenWidth <= 768;

  return (
    <>
      {navLinks.map((link, index) => (
        <Link key={index} to={link.path} className={`nav-link ${isActive(link.path)}`}>
          <span className="material-icons">{link.icon}</span>
          <span className="label">{link.label}</span>
        </Link>
      ))}

      {!isMobile && (
        <>
          <Link to="/message" className={`nav-link ${isActive('/message')}`}>
            <span className="material-icons">near_me</span>
            <span className="label">{t('message')}</span>
          </Link>

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
            <span className="label">{t('search')}</span>
          </Link>

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
            <span className="label">{t('notifications')}</span>
            {notify.data.length > 0 && (
              <span className="notify_length">{notify.data.length}</span>
            )}
          </Link>
        </>
      )}

      <Link to={`/profile/id/${auth.user._id}`} className={`nav-link ${isActive(`/profile/id/${auth.user._id}`)}`}>
        <Avatar src={auth.user.avatar} size="medium-avatar" />
        <span className="label">{t('profile')}</span>
      </Link>

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