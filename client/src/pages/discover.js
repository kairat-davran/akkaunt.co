import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDiscoverPosts } from '../redux/actions/discoverAction';
import { useNavigate } from 'react-router-dom';
import { patchDataAPI } from '../utils/fetchData';

const Discover = () => {
  const auth = useSelector(state => state.auth);
  const discover = useSelector(state => state.discover);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadMore, setLoadMore] = useState(false);

  useEffect(() => {
    if (auth.token && !discover.firstLoad) {
      dispatch(getDiscoverPosts(auth.token, 1));
    }
  }, [dispatch, auth.token, discover.firstLoad]);

  const handleLoadMore = async () => {
    if (loadMore || discover.loading) return;
    setLoadMore(true);
    await dispatch(getDiscoverPosts(auth.token, discover.page));
    setLoadMore(false);
  };

  const handleResetDiscover = async () => {
    try {
      await patchDataAPI('reset_discover', null, auth.token);
      dispatch(getDiscoverPosts(auth.token, 1));
    } catch (err) {
      alert('Failed to reset discover');
    }
  };

  return (
    <div className="discover-page">
      {discover.loading && discover.page === 1 && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {discover.posts.length === 0 && !discover.loading ? (
        <div className="discover-empty">
          <p className="discover-message">
            🎉 You’ve seen all new content. Check back later!
          </p>
          <button onClick={handleResetDiscover} className="reset-btn">
            🔁 Reset Discover
          </button>
        </div>
      ) : (
        <div className="grid-layout">
          {discover.posts.map((post, i) => {
            let layoutClass = '';
            if (i % 10 === 2) layoutClass = 'tall right';
            else if (i % 10 === 5) layoutClass = 'tall left';

            return (
              <div
                key={post._id}
                className={`grid-item ${layoutClass}`}
                onClick={() => navigate(`/post/${post._id}`)}
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
          })}
        </div>
      )}

      {loadMore &&
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      }
      {!discover.loading && discover.result >= 10 && (
        <button className="load-more" onClick={handleLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Discover;