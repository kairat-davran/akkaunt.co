import React from 'react';
import { useNavigate } from 'react-router-dom';
import useSeenTracker from '../hooks/useSeenTracker';

const DiscoverPostCard = ({ post, layoutClass, onSeen }) => {
  const navigate = useNavigate();
  const seenRef = useSeenTracker(post._id, onSeen);

  return (
    <div
      ref={seenRef}
      className={`grid-item ${layoutClass}`}
      onClick={() => navigate(`/post/id/${post._id}`)}
    >
      <img src={post.images[0]?.url} alt="post" />
      <div className="overlay">
        <div className="icon-info">
          <span className="material-icons">favorite_border</span>
          <span>{post.likes.length}</span>
        </div>
        <div className="icon-info">
          <span className="material-icons">chat_bubble_outline</span>
          <span>{post.comments.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPostCard;