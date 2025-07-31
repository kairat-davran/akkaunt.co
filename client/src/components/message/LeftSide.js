import React, { useState, useEffect, useRef } from 'react';
import UserCard from '../UserCard';
import { useSelector, useDispatch } from 'react-redux';
import { getDataAPI } from '../../utils/fetchData';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { useNavigate, useParams } from 'react-router-dom';
import { MESS_TYPES, getConversations } from '../../redux/actions/messageAction';
import { useTranslation } from 'react-i18next';

const LeftSide = ({ setIsLeftOpen }) => {
  const { t } = useTranslation();

  const auth = useSelector(state => state.auth)
  const message = useSelector(state => state.message)
  const online = useSelector(state => state.online)
  const dispatch = useDispatch()

  const [search, setSearch] = useState('')
  const [searchUsers, setSearchUsers] = useState([])

  const navigate = useNavigate()
  const { id } = useParams()

  const pageEnd = useRef()
  const [page, setPage] = useState(0)

  const handleSearch = async e => {
    e.preventDefault()
    if (!search) return setSearchUsers([]);

    try {
      const res = await getDataAPI(`search?username=${search}`, auth.token)
      setSearchUsers(res.data.users)
    } catch (err) {
      dispatch({
        type: GLOBALTYPES.ALERT, payload: { error: err.response.data.msg }
      })
    }
  }

  const handleAddUser = (user) => {
    setSearch('')
    setSearchUsers([])
    dispatch({ type: MESS_TYPES.ADD_USER, payload: { ...user, text: '', media: [] } })
    dispatch({ type: MESS_TYPES.CHECK_ONLINE_OFFLINE, payload: online })

    if (typeof setIsLeftOpen === 'function') setIsLeftOpen(false);
    
    navigate(`/message/id/${user._id}`);
  }

  const isActive = (user) => {
    return id === user._id ? 'active' : ''
  }

  useEffect(() => {
    if (message.firstLoad) return;
    dispatch(getConversations({ auth }))
  }, [dispatch, auth, message.firstLoad])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(p => p + 1)
      }
    }, {
      threshold: 0.1
    })

    observer.observe(pageEnd.current)
  }, [setPage])

  useEffect(() => {
    if (message.resultUsers >= (page - 1) * 9 && page > 1) {
      dispatch(getConversations({ auth, page }))
    }
  }, [message.resultUsers, page, auth, dispatch])

  useEffect(() => {
    if (message.firstLoad) {
      dispatch({ type: MESS_TYPES.CHECK_ONLINE_OFFLINE, payload: online })
    }
  }, [online, message.firstLoad, dispatch])

  return (
    <>
      <div className="dm-header">
        {window.innerWidth <= 768 && (
          <div className="dm-header-top">
            <span className="material-icons" onClick={() => navigate('/')}>
              arrow_back
            </span>
            <span className="dm-username">
              {id
                ? message.users.find(u => u._id === id)?.username || t('chat')
                : t('messages')}
            </span>
          </div>
        )}

        <form className="dm-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={search}
            placeholder={t('search_users')}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" style={{ display: 'none' }}>Search</button>
        </form>
      </div>

      <div className="message_chat_list">
        <div
          className={`message_user ${id === 'bazar' ? 'active' : ''}`}
          onClick={() => navigate('/message/sub/bazar')}
        >
          <div className="d-flex align-items-center px-2 py-2">
            <span className="material-icons me-3" style={{ fontSize: '28px' }}>
              storefront
            </span>
            <div className="text-truncate">
              <strong>{t('bazar_chat')}</strong>
              <div className="text-muted small">{t('bazar_messages')}</div>
            </div>
          </div>
        </div>
        {
          searchUsers.length !== 0
          ? searchUsers.map(user => (
            <div key={user._id} className={`message_user ${isActive(user)}`}
              onClick={() => handleAddUser(user)}>
              <UserCard user={user} />
            </div>
          ))
          : message.users.map(user => (
            <div key={user._id} className={`message_user ${isActive(user)}`}
              onClick={() => handleAddUser(user)}>
              <UserCard user={user} msg={true}>
                {
                  user.online
                    ? <i className="fas fa-circle text-success" />
                    : auth.user.following.find(item =>
                      item._id === user._id
                    ) && <i className="fas fa-circle" />
                }
              </UserCard>
            </div>
          ))
        }

        <button ref={pageEnd} style={{ opacity: 0 }}>Load More</button>
      </div>
    </>
  )
}

export default LeftSide