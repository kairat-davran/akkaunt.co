import { BrowserRouter as Router } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';

import Alert from './components/alert/Alert';
import Loading from './components/alert/Loading';

import { refreshToken } from './redux/actions/authAction';
import { getPosts } from './redux/actions/postAction';
import { getSuggestions } from './redux/actions/suggestionsAction';
import { getNotifies } from './redux/actions/notifyAction';
import { setPeer, setSocket } from './redux/reducers/communicationSlice';

import io from "socket.io-client";
import Peer from 'peerjs';
import { BASE_URL } from './utils/config';

import AppRouter from './customRouter/AppRouter';

function App() {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    dispatch(refreshToken()).finally(() => {
      setIsAuthLoading(false);
    });

    const socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    dispatch(setSocket(socket));
    return () => socket.disconnect();
  }, [dispatch]);

  useEffect(() => {
    if (auth.token) {
      dispatch(getPosts(auth.token));
      dispatch(getSuggestions(auth.token));
      dispatch(getNotifies(auth.token));
    }
  }, [dispatch, auth.token]);

  useEffect(() => {
    const newPeer = new Peer(undefined, { path: '/', secure: true });
    dispatch(setPeer(newPeer));
  }, [dispatch]);

  if (isAuthLoading) return <Loading />;

  return (
    <Router>
      <Alert />
      <AppRouter />
    </Router>
  );
}

export default App;