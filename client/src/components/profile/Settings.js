import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../../redux/actions/profileAction'
import { logout } from '../../redux/actions/authAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import ChangePassword from './ChangePassword'

const Settings = ({ setShowSettings, setOnEdit }) => {
  const dispatch = useDispatch()
  const theme = useSelector(state => state.theme)
  const auth = useSelector(state => state.auth)
  const [showChangePass, setShowChangePass] = useState(false)

  const handleLogout = () => {
    setShowSettings(false)
    dispatch({ type: GLOBALTYPES.AUTH, payload: {} })
    dispatch({ type: GLOBALTYPES.THEME, payload: false }) 
    dispatch(logout())
  }

  const handleDeleteAccount = () => {
    setShowSettings(false)
    const confirmDel = window.confirm("Are you sure you want to delete your account?")
    if (confirmDel) {
      alert("Delete account functionality not implemented.")
      // dispatch(deleteAccount())
    }
  }

  const handleToggleTheme = async () => {
    dispatch(toggleTheme(auth, theme))
    setShowSettings(false)
  }

  return (
    <div className="settings">
      <div className="settings_box">
        <div className="settings_header">
          <h4>{showChangePass ? 'Change Password' : 'Account Settings'}</h4>
          <span
            onClick={() => {
              if (showChangePass) setShowChangePass(false)
              else setShowSettings(false)
            }}
            className="settings_close"
          >
            &times;
          </span>
        </div>

        {showChangePass ? (
          <ChangePassword setShowChangePass={setShowChangePass} />
        ) : (
          <>
            {/* Profile Section */}
            <div className="settings_section">
              <div className="settings_item" onClick={() => {
                setShowSettings(false)
                setOnEdit(true)
              }}>
                <span className="material-icons settings_icon_item">edit</span> Edit Profile
              </div>

              <div className="settings_item" onClick={() => setShowChangePass(true)}>
                <span className="material-icons settings_icon_item">vpn_key</span> Change Password
              </div>
            </div>

            {/* Preferences Section */}
            <div className="settings_section">
              <div className="settings_item" onClick={handleToggleTheme}>
                <span className="material-icons settings_icon_item">brightness_6</span> {theme ? 'Light Mode' : 'Dark Mode'}
              </div>

              <div className="settings_item">
                <span className="material-icons settings_icon_item">language</span> Language:
                <select
                  className="language_select"
                  onChange={(e) => alert(`Language switched to ${e.target.value}`)}
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="kg">Кыргызча</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="settings_section">
              <div className="settings_item" onClick={handleLogout}>
                <span className="material-icons settings_icon_item">logout</span> Logout
              </div>

              <div className="settings_item danger" onClick={handleDeleteAccount}>
                <span className="material-icons settings_icon_item">delete_forever</span> Delete Account
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Settings