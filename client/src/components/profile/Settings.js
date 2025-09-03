import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../../redux/actions/profileAction'
import { logout } from '../../redux/actions/authAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import ChangePassword from './ChangePassword'
import { useTranslation } from 'react-i18next'

const Settings = ({ setShowSettings, setOnEdit }) => {
  const dispatch = useDispatch()
  const theme = useSelector(state => state.theme)
  const auth = useSelector(state => state.auth)
  const [showChangePass, setShowChangePass] = useState(false)

  const { t, i18n } = useTranslation()

  const handleLogout = () => {
    setShowSettings(false)
    dispatch({ type: GLOBALTYPES.AUTH, payload: {} })
    dispatch({ type: GLOBALTYPES.THEME, payload: false }) 
    dispatch(logout())
  }

  const handleDeleteAccount = () => {
    setShowSettings(false)
    const confirmDel = window.confirm(t('confirm_delete'))
    if (confirmDel) {
      alert(t('not_implemented'))
      // dispatch(deleteAccount())
    }
  }

  const handleToggleTheme = async () => {
    dispatch(toggleTheme(auth, theme))
    setShowSettings(false)
  }

  const handleChangeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setShowSettings(false)
  }

  return (
    <div className="settings">
      <div className="settings_box">
        <div className="settings_header">
          <h4>{showChangePass ? t('change_password') : t('account_settings')}</h4>
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
            <div className="settings_section">
              <div
                className="settings_item"
                onClick={() => {
                  setShowSettings(false)
                  setOnEdit(true)
                }}
              >
                <span className="material-icons settings_icon_item">edit</span> {t('edit_profile')}
              </div>

              <div className="settings_item" onClick={() => setShowChangePass(true)}>
                <span className="material-icons settings_icon_item">vpn_key</span> {t('change_password')}
              </div>
            </div>

            <div className="settings_section">
              <div className="settings_item" onClick={handleToggleTheme}>
                <span className="material-icons settings_icon_item">brightness_6</span> 
                {theme ? t('light_mode') : t('dark_mode')}
              </div>

              <div className="settings_item">
                <span className="material-icons settings_icon_item">language</span> {t('language')}:
                <select
                  className="language_select"
                  onChange={(e) => handleChangeLanguage(e.target.value)}
                  value={i18n.language}
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="ky">Кыргызча</option>
                </select>
              </div>
            </div>

            <div className="settings_section">
              <div className="settings_item" onClick={handleLogout}>
                <span className="material-icons settings_icon_item">logout</span> {t('logout')}
              </div>

              <div className="settings_item danger" onClick={handleDeleteAccount}>
                <span className="material-icons settings_icon_item">delete_forever</span> {t('delete_account')}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Settings