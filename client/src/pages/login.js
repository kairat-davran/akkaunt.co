import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../redux/actions/authAction'

const Login = () => {
  const auth = useSelector(state => state.auth);
  const initialState = { username: '', password: '' };
  const [userData, setUserData] = useState(initialState);
  const { username, password } = userData;

  const [typePass, setTypePass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.token) navigate("/");
  }, [auth.token, navigate]);

  const handleChangeInput = e => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(login(userData));
  };

  return (
    <div className="auth_page">
      <form onSubmit={handleSubmit}>
        <h3 className="text-uppercase text-center mb-4">akkaunt</h3>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" className="form-control" id="username"
            onChange={handleChangeInput} value={username} name="username" />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="pass">
            <input type={typePass ? "text" : "password"} className="form-control" id="password"
              onChange={handleChangeInput} value={password} name="password" />
            <small onClick={() => setTypePass(!typePass)}>
              {typePass ? "Hide" : "Show"}
            </small>
          </div>
        </div>

        <button type="submit" className="btn btn-dark w-100"
          disabled={!username || !password}>
          Login
        </button>

        <p className="my2">
          You don't have an account? <Link to="/register" style={{ color: "crimson" }}>Register Now</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;