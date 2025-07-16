import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import NotifyModal from '../NotifyModal';
import SearchSide from './SearchSide';

const MobileTopBar = () => {
  const { pathname } = useLocation();
  const notify = useSelector(state => state.notify);

  const [openSearch, setOpenSearch] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Close modals when navigating to a new page
    setOpenSearch(false);
    setOpenNotify(false);
  }, [pathname]);

  return (
    <div className="mobile-topbar">
      {/* Only show on / */}
      {pathname === '/' && (
        <>
          <div className="topbar-left">
            <Link to="/" onClick={() => window.scrollTo({ top: 0 })}>
              <h1 className="logo">akkaunt</h1>
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
                setOpenSearch(false);
              }}
              className={`nav-link ${openNotify ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <span
                className="material-icons"
                style={{ color: notify.data.length > 0 ? 'crimson' : '' }}
              >
                favorite
              </span>
              {notify.data.length > 0 && (
                <span className="notify_length">{notify.data.length}</span>
              )}
            </Link>
          </div>
        </>
      )}

      {/* Only show search on /discover */}
      {pathname === '/discover' && (
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
        </Link>
      )}

      {/* Modals */}
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
    </div>
  );
};

export default MobileTopBar;