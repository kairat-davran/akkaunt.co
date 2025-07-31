import React, { useEffect, useState } from 'react'
import Avatar from '../Avatar'
import FollowBtn from '../FollowBtn'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { useTranslation } from 'react-i18next'

const Info = ({
  id, auth, profile, dispatch,
  onEdit, setOnEdit,
  showFollowers, setShowFollowers,
  showFollowing, setShowFollowing,
  setShowSettings
}) => {
  const [userData, setUserData] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    if (id === auth.user._id) {
      setUserData([auth.user])
    } else {
      const newData = profile.users.filter(user => user._id === id)
      setUserData(newData)
    }
  }, [id, auth, profile.users])

  useEffect(() => {
    if (showFollowers || showFollowing || onEdit) {
      dispatch({ type: GLOBALTYPES.MODAL, payload: true })
    } else {
      dispatch({ type: GLOBALTYPES.MODAL, payload: false })
    }
  }, [showFollowers, showFollowing, onEdit, dispatch])

  return (
    <div className="info">
      {userData.map(user => (
        <div className="info_container" key={user._id}>
          <Avatar src={user.avatar} size="supper-avatar" />

          <div className="info_content">
            <div className="info_content_title">
              <h2>{user.username}</h2>

              {user._id === auth.user._id ? (
                <button
                  className="btn btn-outline-info"
                  onClick={() => setOnEdit(true)}
                >
                  {t('edit_profile')}
                </button>
              ) : (
                <FollowBtn user={user} />
              )}

              {user._id === auth.user._id && (
                <span
                  className="settings_icon material-icons"
                  onClick={() => setShowSettings(true)}
                >
                  settings
                </span>
              )}
            </div>

            <div className="follow_btn">
              <span className="mr-4" onClick={() => setShowFollowers(true)}>
                {user.followers.length} {t('followers')}
              </span>
              <span className="ml-4" onClick={() => setShowFollowing(true)}>
                {user.following.length} {t('following')}
              </span>
            </div>

            <h6>{user.fullname}</h6>

            {user.story && <p>{user.story}</p>}

            {user.website && (
              <a href={user.website} target="_blank" rel="noreferrer">
                {user.website}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Info