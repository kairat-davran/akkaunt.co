const valid = ({ fullname, username, mobile, password, cf_password }) => {
  const err = {};

  if (!fullname) {
    err.fullname = "Please add your full name.";
  } else if (fullname.length > 25) {
    err.fullname = "Full name is up to 25 characters long.";
  }

  if (!username) {
    err.username = "Please add your user name.";
  } else if (username.replace(/ /g, '').length > 25) {
    err.username = "User name is up to 25 characters long.";
  }

  if (!mobile) {
    err.mobile = "Please add your phone number.";
  } else if (!/^\+\d{10,15}$/.test(mobile)) {
    err.mobile = "Phone number must be in international format (e.g., +12345678900)";
  }

  if (!password) {
    err.password = "Please add your password.";
  } else if (password.length < 6) {
    err.password = "Password must be at least 6 characters.";
  }

  if (password !== cf_password) {
    err.cf_password = "Confirm password did not match.";
  }

  return {
    errMsg: err,
    errLength: Object.keys(err).length
  };
};

export default valid;