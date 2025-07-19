import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, precheckRegister } from '../redux/actions/authAction';
import { GLOBALTYPES } from '../redux/actions/globalTypes';
import { auth } from '../firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

const Register = () => {
  const authRedux = useSelector(state => state.auth);
  const alert = useSelector(state => state.alert);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialState = {
    fullname: '', username: '', mobile: '', password: '', cf_password: '', gender: 'male'
  };
  const [userData, setUserData] = useState(initialState);
  const { fullname, username, mobile, password, cf_password, gender } = userData;

  const [typePass, setTypePass] = useState(false);
  const [typeCfPass, setCfTypePass] = useState(false);

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authRedux.token) navigate('/');
  }, [authRedux.token, navigate]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LdPS4grAAAAAAgwybz9eWfydZ3y4EggjM-fLCSt';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleChangeInput = e => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const createV3AppVerifier = (token) => ({
    type: 'recaptcha',
    verify: () => Promise.resolve(token),
    _reset: () => {}
  });

  const handlePrecheck = async (e) => {
    e.preventDefault();
    dispatch({ type: GLOBALTYPES.ALERT, payload: {} });
    setLoading(true);

    const result = await dispatch(precheckRegister({ fullname, username, mobile, password, cf_password }));
    if (!result) {
      setLoading(false);
      return;
    }

    try {
      const token = await window.grecaptcha.enterprise.execute('6LdPS4grAAAAAAgwybz9eWfydZ3y4EggjM-fLCSt', { action: 'register' });
      const appVerifier = createV3AppVerifier(token);
      const confirmation = await signInWithPhoneNumber(auth, mobile, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: 'SMS failed: ' + err.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;

    try {
      await confirmationResult.confirm(otp);

      const newUserData = {
        fullname,
        username: username.toLowerCase().replace(/ /g, ''),
        mobile,
        password,
        cf_password,
        gender
      };

      await dispatch(register(newUserData));
    } catch (err) {
      setOtp('');
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: {
          error: err.response?.data?.msg || err.message || 'Registration failed'
        }
      });
    }
  };

  return (
    <div className="auth_page">
      <form onSubmit={step === 1 ? handlePrecheck : handleVerifyAndRegister}>
        <h3 className="text-uppercase text-center mb-4">akkaunt</h3>

        {step === 1 && (
          <>
            <div className="form-group">
              <label htmlFor="mobile">Phone Number</label>
              <input type="text" className="form-control" id="mobile" name="mobile"
                onChange={handleChangeInput} value={mobile}
                style={{ background: alert.mobile ? '#fd2d6a14' : '' }} />
              <small className="form-text text-danger">{alert.mobile || ''}</small>
            </div>

            <div className="form-group">
              <label htmlFor="fullname">Full Name</label>
              <input type="text" className="form-control" id="fullname" name="fullname"
                onChange={handleChangeInput} value={fullname}
                style={{ background: alert.fullname ? '#fd2d6a14' : '' }} />
              <small className="form-text text-danger">{alert.fullname || ''}</small>
            </div>

            <div className="form-group">
              <label htmlFor="username">User Name</label>
              <input type="text" className="form-control" id="username" name="username"
                onChange={handleChangeInput} value={username.toLowerCase().replace(/ /g, '')}
                style={{ background: alert.username ? '#fd2d6a14' : '' }} />
              <small className="form-text text-danger">{alert.username || ''}</small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="pass">
                <input type={typePass ? "text" : "password"} className="form-control" id="password"
                  onChange={handleChangeInput} value={password} name="password"
                  style={{ background: alert.password ? '#fd2d6a14' : '' }} />
                <small onClick={() => setTypePass(!typePass)}>{typePass ? 'Hide' : 'Show'}</small>
              </div>
              <small className="form-text text-danger">{alert.password || ''}</small>
            </div>

            <div className="form-group">
              <label htmlFor="cf_password">Confirm Password</label>
              <div className="pass">
                <input type={typeCfPass ? "text" : "password"} className="form-control" id="cf_password"
                  onChange={handleChangeInput} value={cf_password} name="cf_password"
                  style={{ background: alert.cf_password ? '#fd2d6a14' : '' }} />
                <small onClick={() => setCfTypePass(!typeCfPass)}>{typeCfPass ? 'Hide' : 'Show'}</small>
              </div>
              <small className="form-text text-danger">{alert.cf_password || ''}</small>
            </div>

            <div className="row justify-content-between mx-0 mb-1">
              <label htmlFor="male">Male: <input type="radio" id="male" name="gender" value="male" defaultChecked onChange={handleChangeInput} /></label>
              <label htmlFor="female">Female: <input type="radio" id="female" name="gender" value="female" onChange={handleChangeInput} /></label>
              <label htmlFor="other">Other: <input type="radio" id="other" name="gender" value="other" onChange={handleChangeInput} /></label>
            </div>

            <button type="submit" className="btn btn-dark w-100" disabled={loading}>
              {loading ? 'Please wait...' : 'Next'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input type="text" className="form-control" id="otp" value={otp}
                onChange={(e) => setOtp(e.target.value)} />
              <small className="form-text text-danger">{alert.otp || ''}</small>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>

              <button type="submit" className="btn btn-dark" disabled={loading}>
                {loading ? 'Please wait...' : 'Verify & Register'}
              </button>
            </div>
          </>
        )}

        <p className="my-2">
          Already have an account? <Link to="/" style={{ color: "crimson" }}>Login Now</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;