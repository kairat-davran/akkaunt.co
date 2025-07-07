import React from 'react';
import { Link } from 'react-router-dom';
import MenuSide from './MenuSide';

const Sidebar = () => {

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" onClick={() => window.scrollTo({ top: 0 })}>
          <h1 className="logo">akkaunt</h1>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <MenuSide />
      </nav>
    </aside>
  );
};

export default Sidebar;