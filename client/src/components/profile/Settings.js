import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/actions/authAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import ChangePassword from './ChangePassword'

const Settings = ({ setShowSettings, setOnEdit }) => {
  const dispatch = useDispatch()
  const theme = useSelector(state => state.theme)
  const [showChangePass, setShowChangePass] = useState(false)

  const handleLogout = () => {
    setShowSettings(false)
    dispatch({ type: GLOBALTYPES.AUTH, payload: {} })
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
                <i className="fas fa-user-edit settings_icon_item" /> Edit Profile
              </div>

              <div className="settings_item" onClick={() => setShowChangePass(true)}>
                <i className="fas fa-key settings_icon_item" /> Change Password
              </div>
            </div>

            {/* Preferences Section */}
            <div className="settings_section">
              <div className="settings_item" onClick={() => {
                setShowSettings(false)
                dispatch({ type: GLOBALTYPES.THEME, payload: !theme })
              }}>
                <i className="fas fa-adjust settings_icon_item" /> {theme ? 'Light Mode' : 'Dark Mode'}
              </div>

              <div className="settings_item">
                <i className="fas fa-globe settings_icon_item" /> Language:
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
                <i className="fas fa-sign-out-alt settings_icon_item" /> Logout
              </div>

              <div className="settings_item danger" onClick={handleDeleteAccount}>
                <i className="fas fa-trash-alt settings_icon_item" /> Delete Account
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Settings