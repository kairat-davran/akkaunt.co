import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkImage } from '../../utils/imageUpload'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { updateProfileUser } from '../../redux/actions/profileAction'
import { useTranslation } from 'react-i18next'

const EditProfile = ({ setOnEdit }) => {
  const { t } = useTranslation()
  const initState = {
    fullname: '',
    mobile: '',
    website: '',
    story: '',
    gender: ''
  }

  const [userData, setUserData] = useState(initState)
  const { fullname, mobile, website, story, gender } = userData
  const [avatar, setAvatar] = useState('')

  const auth = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    setUserData(auth.user)
  }, [auth.user])

  const changeAvatar = (e) => {
    const file = e.target.files[0]
    const err = checkImage(file)
    if (err)
      return dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: err }
      })
    setAvatar(file)
  }

  const handleInput = (e) => {
    const { name, value } = e.target
    setUserData({ ...userData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(updateProfileUser({ userData, avatar, auth }))
    setOnEdit(false)
  }

  return (
    <div className="edit_profile">
      <form onSubmit={handleSubmit}>
        <span className="edit_close" onClick={() => setOnEdit(false)}>
          &times;
        </span>

        <div className="info_avatar">
          <img
            src={avatar ? URL.createObjectURL(avatar) : auth.user.avatar}
            alt="avatar"
          />
          <span>
            <i className="fas fa-camera" />
            <p>{t('change_avatar')}</p>
            <input
              type="file"
              name="file"
              id="file_up"
              accept="image/*"
              onChange={changeAvatar}
            />
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="fullname">{t('full_name')}</label>
          <div className="position-relative">
            <input
              type="text"
              className="form-control"
              id="fullname"
              name="fullname"
              value={fullname}
              onChange={handleInput}
            />
            <small className="text-danger position-absolute"
              style={{ top: '50%', right: '5px', transform: 'translateY(-50%)' }}>
              {fullname.length}/25
            </small>
          </div>
        </div>

        <div className="form_group">
          <label htmlFor="mobile">{t('mobile')}</label>
          <input
            type="text"
            name="mobile"
            value={mobile}
            className="form-control"
            onChange={handleInput}
          />
        </div>

        <div className="form_group">
          <label htmlFor="website">{t('website')}</label>
          <input
            type="text"
            name="website"
            value={website}
            className="form-control"
            onChange={handleInput}
          />
        </div>

        <div className="form_group">
          <label htmlFor="story">{t('story')}</label>
          <textarea
            name="story"
            value={story}
            cols="30"
            rows="4"
            className="form-control"
            onChange={handleInput}
          />
          <small className="text-danger d-block text-right">
            {story.length}/200
          </small>
        </div>

        <label htmlFor="gender">{t('gender')}</label>
        <div className="input-group-prepend px-0 mb-4">
          <select
            name="gender"
            id="gender"
            value={gender}
            className="custom-select text-capitalize"
            onChange={handleInput}
          >
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
            <option value="other">{t('other')}</option>
          </select>
        </div>

        <button className="btn btn-info w-100" type="submit">
          {t('save')}
        </button>
      </form>
    </div>
  )
}

export default EditProfile