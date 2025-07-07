import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DISCOVER_TYPES, getDiscoverPosts } from '../redux/actions/discoverAction';
import { getDataAPI } from '../utils/fetchData';
import LoadIcon from '../images/loading.gif';
import { useNavigate } from 'react-router-dom';

const Discover = () => {
  const auth = useSelector(state => state.auth);
  const discover = useSelector(state => state.discover);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadMore, setLoadMore] = useState(false);

  useEffect(() => {
    if (!discover.firstLoad) {
      dispatch(getDiscoverPosts(auth.token));
    }
  }, [dispatch, auth.token, discover.firstLoad]);

  const handleLoadMore = async () => {
    setLoadMore(true);
    const res = await getDataAPI(`post_discover?num=${discover.page * 9}`, auth.token);
    dispatch({ type: DISCOVER_TYPES.UPDATE_POST, payload: res.data });
    setLoadMore(false);
  };

  return (
    <div className="discover-page">
      {discover.loading && <img src={LoadIcon} alt="loading" className="loading" />}

      <div className="grid-layout">
        {discover.posts.map((post, i) => {
          const isTall = i % 6 === 2 || i % 6 === 5;
          return (
            <div
              key={post._id}
              className={`grid-item ${isTall ? 'tall' : ''}`}
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

      {loadMore && <img src={LoadIcon} alt="loading" className="loading" />}
      {!discover.loading && (
        <button className="load-more" onClick={handleLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Discover;