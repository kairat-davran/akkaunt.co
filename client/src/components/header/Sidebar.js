import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MenuSide from './MenuSide';
import MobileTopBar from './MobileTopBar';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const location = useLocation();
  const theme = useSelector(state => state.theme);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {screenWidth <= 768 && (location.pathname === '/' || location.pathname === '/discover') && (
        <MobileTopBar />
      )}

      <aside className="sidebar">
        {screenWidth > 768 && (
          <div className="sidebar-header">
            <Link to="/" onClick={() => window.scrollTo({ top: 0 })}>
              {screenWidth <= 1024 ? (
                <img
                  src={theme ? '/images/akkaunt-light.png' : '/images/akkaunt-dark.png'}
                  alt="akkaunt"
                  className="logo-icon"
                  style={{ width: '36px', height: '36px' }}
                />
              ) : (
                <h1 className="logo">αккαυηт</h1>
              )}
            </Link>
          </div>
        )}

        <nav className="sidebar-nav">
          <MenuSide />
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;