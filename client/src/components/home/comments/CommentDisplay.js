import React, { useEffect, useState } from 'react'
import CommentCard from './CommentCard'
import { useTranslation } from 'react-i18next'

const CommentDisplay = ({ comment, post, replyCm }) => {
  const { t } = useTranslation()
  const [showRep, setShowRep] = useState([])
  const [next, setNext] = useState(1)

  useEffect(() => {
    setShowRep(replyCm.slice(replyCm.length - next))
  }, [replyCm, next])

  return (
    <div className="comment_display">
      <CommentCard comment={comment} post={post} commentId={comment._id}>
        <div className="pl-4">
          {showRep.map((item, index) => (
            item.reply &&
            <CommentCard
              key={index}
              comment={item}
              post={post}
              commentId={comment._id}
            />
          ))}

          {replyCm.length - next > 0 ? (
            <div
              style={{ cursor: 'pointer', color: 'crimson' }}
              onClick={() => setNext(next + 10)}
            >
              {t('see_more_comments')}
            </div>
          ) : replyCm.length > 1 ? (
            <div
              style={{ cursor: 'pointer', color: 'crimson' }}
              onClick={() => setNext(1)}
            >
              {t('hide_comments')}
            </div>
          ) : null}
        </div>
      </CommentCard>
    </div>
  )
}

export default CommentDisplay