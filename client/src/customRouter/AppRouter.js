import React from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import StatusModal from '../components/StatusModal';
import SocketClient from '../SocketClient';
import CallModal from '../components/message/CallModal';

import Home from '../pages/home';
import Login from '../pages/login';
import Register from '../pages/register';
import PageRender from '../customRouter/PageRender';
import PrivateRouter from '../customRouter/PrivateRouter';
import Sidebar from '../components/header/Sidebar';

const AppRouter = () => {
  const { pathname } = useLocation();
  const auth = useSelector(state => state.auth);
  const status = useSelector(state => state.status);
  const modal = useSelector(state => state.modal);
  const call = useSelector(state => state.call);
  const theme = useSelector(state => state.theme)

  const isMobileOrTablet = window.innerWidth <= 1024;
  const hideHeader =
    isMobileOrTablet &&
    (pathname.startsWith('/message') || pathname.startsWith('/profile'));

  return (
    <>
      <input type="checkbox" id="theme" />
      <div className={`App ${theme ? 'dark' : ''} ${(status || modal) ? 'mode' : ''}`}>
        {auth.token && !hideHeader && <Sidebar />}
        {status && <StatusModal />}
        {auth.token && <SocketClient />}
        {call && <CallModal />}

        <div className={`main ${auth.token && !hideHeader ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route path="/" element={auth.token ? <Home /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/:page" element={<PrivateRouter><PageRender /></PrivateRouter>} />
            <Route path="/:page/:id" element={<PrivateRouter><PageRender /></PrivateRouter>} />
            <Route path="/:page/:subpage/:id" element={<PrivateRouter><PageRender /></PrivateRouter>} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AppRouter;