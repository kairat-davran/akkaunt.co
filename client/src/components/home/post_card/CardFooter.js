import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LikeButton from '../../LikeButton'
import { useDispatch, useSelector } from 'react-redux'
import { likePost, savePost, unLikePost, unSavePost } from '../../../redux/actions/postAction'
import ShareModal from '../../ShareModal'
import { BASE_URL } from '../../../utils/config'
import { useTranslation } from 'react-i18next';

const CardFooter = ({post}) => {
  const { t } = useTranslation();
  const [isLike, setIsLike] = useState(false)
  const [loadLike, setLoadLike] = useState(false)

  const [isShare, setIsShare] = useState(false)

  const auth = useSelector(state => state.auth)
  const theme = useSelector(state => state.theme)
  const socket = useSelector(state => state.communication.socket)
  const dispatch = useDispatch()

  const [saved, setSaved] = useState(false)
  const [saveLoad, setSaveLoad] = useState(false)

  // Likes
  useEffect(() => {
    if(post.likes.find(like => like._id === auth.user._id)){
      setIsLike(true)
    }else{
      setIsLike(false)
    }
  }, [post.likes, auth.user._id])

  const handleLike = async () => {
    if(loadLike) return;
    setIsLike(true)

    setLoadLike(true)
    await dispatch(likePost({post, auth, socket}))
    setLoadLike(false)
  }

  const handleUnLike = async () => {
    if(loadLike) return;
    setIsLike(false)

    setLoadLike(true)
    await dispatch(unLikePost({post, auth, socket}))
    setLoadLike(false)
  }

  // Saved
  useEffect(() => {
    if(auth.user.saved.find(id => id === post._id)){
      setSaved(true)
    }else{
      setSaved(false)
    }
  },[auth.user.saved, post._id])

  const handleSavePost = async () => {
    if(saveLoad) return;
        
    setSaveLoad(true)
    await dispatch(savePost({post, auth}))
    setSaveLoad(false)
  }

  const handleUnSavePost = async () => {
    if(saveLoad) return;

    setSaveLoad(true)
    await dispatch(unSavePost({post, auth}))
    setSaveLoad(false)
  }

  return (
    <div className="card_footer">
      <div className="card_icon_menu">
        <div>
          <LikeButton
          isLike={isLike}
          handleLike={handleLike}
          handleUnLike={handleUnLike}
          />

          <Link to={`/post/id/${post._id}`} className="text-dark">
            <span className="material-icons comment-icon">chat_bubble_outline</span>
          </Link>

          <span
            className="material-icons"
            onClick={() => setIsShare(!isShare)}
            role="button"
            title="Send/Share"
          >
            send
          </span>
        </div>

        {
          saved
          ? <span
              className="material-icons saved"
              onClick={handleUnSavePost}
              title="Unsave"
            >
              bookmark
            </span>
            : <span
                className="material-icons"
                onClick={handleSavePost}
                title="Save"
              >
                bookmark_border
              </span>
        } 
      </div>

      <div className="d-flex justify-content-between">
        <h6 style={{padding: '0 25px', cursor: 'pointer'}}>
          {t('like_with_count', { count: post.likes.length })}
        </h6>
          
        <h6 style={{padding: '0 25px', cursor: 'pointer'}}>
          {t('comment_with_count', { count: post.comments.length })}
        </h6>
      </div>

      {
        isShare && <ShareModal url={`${BASE_URL}/post/${post._id}`} theme={theme} />
      }
    </div>
  )
}

export default CardFooter