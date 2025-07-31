import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CommentDisplay from './comments/CommentDisplay'

const Comments = ({ post }) => {
  const { t } = useTranslation()
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState([])
  const [next, setNext] = useState(2)
  const [replyComments, setReplyComments] = useState([])

  useEffect(() => {
    const newCm = post.comments.filter(cm => !cm.reply)
    setComments(newCm)
    setShowComments(newCm.slice(newCm.length - next))
  }, [post.comments, next])

  useEffect(() => {
    const newRep = post.comments.filter(cm => cm.reply)
    setReplyComments(newRep)
  }, [post.comments])

  return (
    <div>
      {showComments.map((comment, index) => (
        <CommentDisplay
          key={index}
          comment={comment}
          post={post}
          replyCm={replyComments.filter(item => item.reply === comment._id)}
        />
      ))}

      {comments.length - next > 0 ? (
        <div
          className="p-2 border-top"
          style={{ cursor: 'pointer', color: 'crimson' }}
          onClick={() => setNext(next + 10)}
        >
          {t('see_more_comments')}
        </div>
      ) : comments.length > 2 ? (
        <div
          className="p-2 border-top"
          style={{ cursor: 'pointer', color: 'crimson' }}
          onClick={() => setNext(2)}
        >
          {t('hide_comments')}
        </div>
      ) : null}
    </div>
  )
}

export default Comments