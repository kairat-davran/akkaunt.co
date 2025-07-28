import React, { useState, useEffect, useRef } from 'react'
import UserCard from '../UserCard'
import { useSelector, useDispatch } from 'react-redux'
import imageCompression from 'browser-image-compression'
import { useNavigate, useParams } from 'react-router-dom'
import MsgDisplay from './MsgDisplay'
import Icons from '../Icons'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { imageShow, videoShow } from '../../utils/mediaShow'
import { imageUpload } from '../../utils/imageUpload'
import {
  addMessage,
  getMessages,
  loadMoreMessages,
  deleteConversation,
  deleteMessages
} from '../../redux/actions/messageAction'

const RightSide = () => {
  const auth = useSelector(state => state.auth)
  const message = useSelector(state => state.message)
  const socket = useSelector(state => state.communication.socket)
  const peer = useSelector(state => state.communication.peer)
  const dispatch = useDispatch()

  const { id } = useParams()

  const refDisplay = useRef()
  const pageEnd = useRef()

  const [user, setUser] = useState([])
  const [text, setText] = useState('')
  const [media, setMedia] = useState([])
  const [loadMedia, setLoadMedia] = useState(false)
  const [data, setData] = useState([])
  const [result, setResult] = useState(9)
  const [page, setPage] = useState(0)
  const [isLoadMore, setIsLoadMore] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const newData = message.data.find(item => item._id === id)
    if (newData) {
      setData(newData.messages)
      setResult(newData.result)
      setPage(newData.page)
    }
  }, [message.data, id])

  useEffect(() => {
    if (id && message.users.length > 0) {
      setTimeout(() => {
        refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 50)

      const newUser = message.users.find(user => user._id === id)
      if (newUser) setUser(newUser)
    }
  }, [message.users, id])

  const handleChangeMedia = async (e) => {
    const files = [...e.target.files]
    let err = ''
    let newMedia = []

    for (const file of files) {
      if (!file) {
        err = 'File does not exist.'
        continue
      }

      if (file.size > 1024 * 1024 * 20) {
        err = 'The image/video largest is 20MB.'
        continue
      }

      try {
        if (file.type.startsWith('image/')) {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          })
          newMedia.push(compressedFile)
        } else {
          newMedia.push(file)
        }
      } catch (error) {
        console.error('Compression error:', error)
        err = 'Image compression failed.'
      }
    }

    if (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err } })
    }

    setMedia(prev => [...prev, ...newMedia])
  }

  const handleDeleteMedia = (index) => {
    const newArr = [...media]
    newArr.splice(index, 1)
    setMedia(newArr)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() && media.length === 0) return
    setText('')
    setMedia([])
    setLoadMedia(true)

    let newArr = []
    if (media.length > 0) newArr = await imageUpload(media, auth.token)

    const msg = {
      sender: auth.user._id,
      recipient: id,
      text,
      media: newArr,
      createdAt: new Date().toISOString()
    }

    setLoadMedia(false)
    await dispatch(addMessage({ msg, auth, socket }))

    if (refDisplay.current) {
      refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  useEffect(() => {
    const getMessagesData = async () => {
      if (message.data.every(item => item._id !== id)) {
        await dispatch(getMessages({ auth, id }))
        setTimeout(() => {
          if (refDisplay.current) {
            refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
          }
        }, 50)
      }
    }
    getMessagesData()
  }, [id, dispatch, auth, message.data])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsLoadMore(p => p + 1)
      }
    }, {
      threshold: 0.1
    })

    observer.observe(pageEnd.current)
  }, [setIsLoadMore])

  useEffect(() => {
    if (isLoadMore > 1) {
      if (result >= page * 9) {
        dispatch(loadMoreMessages({ auth, id, page: page + 1 }))
        setIsLoadMore(1)
      }
    }
  }, [isLoadMore, dispatch, auth, id, page, result])

  const handleDeleteConversation = () => {
    if (window.confirm('Do you want to delete?')) {
      dispatch(deleteConversation({ auth, id }))
      navigate('/message')
    }
  }

  const handleDeleteMessages = ({ msg, data, auth }) => {
    dispatch(deleteMessages({ msg, data, auth }))
  }

  const caller = ({ video }) => {
    const { _id, avatar, username, fullname } = user
    const msg = {
      sender: auth.user._id,
      recipient: _id,
      avatar, username, fullname, video
    }
    dispatch({ type: GLOBALTYPES.CALL, payload: msg })
  }

  const callUser = ({ video }) => {
    const { _id, avatar, username, fullname } = auth.user
    const msg = {
      sender: _id,
      recipient: user._id,
      avatar, username, fullname, video
    }
    if (peer.open) msg.peerId = peer._id
    socket.emit('callUser', msg)
  }

  const handleAudioCall = () => {
    caller({ video: false })
    callUser({ video: false })
  }

  const handleVideoCall = () => {
    caller({ video: true })
    callUser({ video: true })
  }

  return (
    <>
      <div className="message_header" style={{ cursor: 'pointer' }}>
        {window.innerWidth <= 768 && (
          <span className="dm-back-btn" onClick={() => navigate('/message')}>
            <span className="material-icons">arrow_back</span>
          </span>
        )}
        {user.length !== 0 &&
          <UserCard user={user}>
            <div>
              <span className="material-icons" onClick={handleAudioCall}>call</span>
              <span className="material-icons mx-3" onClick={handleVideoCall}>videocam</span>
              <span className="material-icons text-danger" onClick={handleDeleteConversation}>delete</span>
            </div>
          </UserCard>
        }
      </div>

      <div className="chat_container" style={{ height: media.length > 0 ? 'calc(100% - 180px)' : '' }}>
        <div className="chat_display" ref={refDisplay}>
          <button style={{ marginTop: '-25px', opacity: 0 }} ref={pageEnd}>Load more</button>

          {data.map((msg, index) => (
            <div key={index}>
              {msg.sender !== auth.user._id ? (
                <div className="chat_row other_message">
                  <MsgDisplay user={user} msg={msg} />
                </div>
              ) : (
                <div className="chat_row you_message">
                  <MsgDisplay user={auth.user} msg={msg} data={data} handleDelete={handleDeleteMessages} />
                </div>
              )}
            </div>
          ))}

          {loadMedia && (
            <div className="chat_row you_message">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="show_media" style={{ display: media.length > 0 ? 'grid' : 'none' }}>
        {media.map((item, index) => (
          <div key={index} id="file_media">
            {item.type.match(/video/i)
              ? videoShow(URL.createObjectURL(item))
              : imageShow(URL.createObjectURL(item))}
            <span onClick={() => handleDeleteMedia(index)}>&times;</span>
          </div>
        ))}
      </div>

      <form className="chat_input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your message..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Icons setContent={setText} content={text} />

        <div className="file_upload">
          <span className="material-icons text-danger">image</span>
          <input
            type="file"
            name="file"
            id="file"
            multiple
            accept="image/*,video/*"
            onChange={handleChangeMedia}
          />
        </div>

        <button
          type="submit"
          className="material-icons"
          disabled={!text && media.length === 0}
        >
          near_me
        </button>
      </form>
    </>
  )
}

export default RightSide