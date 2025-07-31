import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createComment } from '../../redux/actions/commentAction'
import Icons from '../Icons'
import { useTranslation } from 'react-i18next'

const InputComment = ({children, post, onReply, setOnReply}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('')

  const auth = useSelector(state => state.auth)
  const socket = useSelector(state => state.communication.socket)
  const dispatch = useDispatch()

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!content.trim()){
      if(setOnReply) return setOnReply(false);
      return;
    }

    setContent('')
    
    const newComment = {
      content,
      likes: [],
      user: auth.user,
      createdAt: new Date().toISOString(),
      reply: onReply && onReply.commentId,
      tag: onReply && onReply.user
    }
    
    dispatch(createComment({post, newComment, auth, socket}))

    if(setOnReply) return setOnReply(false);
  }

  return (
    <form className="card-footer comment_input" onSubmit={handleSubmit} >
      {children}
      <input type="text" placeholder={t('add_comment_placeholder')}
      value={content} onChange={e => setContent(e.target.value)} />

      <Icons setContent={setContent} content={content} />
    </form>
  )
}

export default InputComment