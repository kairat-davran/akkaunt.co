// import { Navigate } from 'react-router-dom';

// const PrivateRouter = ({ children }) => {
//     const firstLogin = localStorage.getItem('firstLogin');
//     return firstLogin ? children : <Navigate to="/" replace />;
// };

// export default PrivateRouter;

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRouter = ({ children }) => {
  const auth = useSelector(state => state.auth);

  return auth.token ? children : <Navigate to="/" replace />;
};

export default PrivateRouter;