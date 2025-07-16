import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const PostThumb = ({ posts, result, initialLoad }) => {
  const theme = useSelector(state => state.theme)

  if (!initialLoad && result === 0 && posts.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <h4 className="text-muted" style={{ fontWeight: 500, fontSize: '1.5rem' }}>
          No Posts Found
        </h4>
      </div>
    )
  }

  return (
    <div className="post_thumb">
      {posts.map(post => (
        <Link
          key={post._id}
          to={`/post/${post._id}`}
          className="post_thumb_display"
        >
          <img
            src={post.images[0].url}
            alt="post"
            style={{
              filter: theme ? 'invert(1)' : 'invert(0)'
            }}
          />
          <div className="post_thumb_menu">
            <div className="icon-info">
              <span className="material-icons">favorite_border</span>
              <span>{post.likes.length}</span>
            </div>
            <div className="icon-info">
              <span className="material-icons">chat_bubble_outline</span>
              <span>{post.comments.length}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default PostThumb