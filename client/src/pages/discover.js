import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getDiscoverPosts } from '../redux/actions/discoverAction';
import { patchDataAPI } from '../utils/fetchData';

import DiscoverPostCard from '../components/DiscoverPostCard';

const Discover = () => {
  const { t } = useTranslation();
  const auth = useSelector(state => state.auth);
  const discover = useSelector(state => state.discover);
  const dispatch = useDispatch();
  const [loadMore, setLoadMore] = useState(false);
  const [seenPostIds, setSeenPostIds] = useState([]);
  const [sentPostIds, setSentPostIds] = useState([]);

  useEffect(() => {
    if (auth.token && !discover.firstLoad) {
      dispatch(getDiscoverPosts(auth.token, 1));
    }
  }, [dispatch, auth.token, discover.firstLoad]);

  const handleLoadMore = useCallback(async () => {
    if (loadMore || discover.loading) return;

    const unseen = seenPostIds.filter(id => !sentPostIds.includes(id));
    if (unseen.length > 0) {
      await patchDataAPI('seen_discover_batch', { postIds: unseen }, auth.token);
      setSentPostIds(prev => [...prev, ...unseen]);
    }

    setLoadMore(true);
    await dispatch(getDiscoverPosts(auth.token, discover.page));
    setLoadMore(false);
  }, [loadMore, discover.loading, seenPostIds, sentPostIds, auth.token, dispatch, discover.page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loadMore &&
        !discover.loading &&
        discover.result >= 10
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, handleLoadMore, discover.loading, discover.result]);

  const handleSeen = (postId) => {
    setSeenPostIds(prev => [...prev, postId]);
  };

  return (
    <div className="discover-page">
      {discover.loading && discover.page === 1 && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {discover.posts.length === 0 && discover.page === 1 && !discover.loading ? (
        <div className="text-center my-5">
          <p>{t('no_posts_available', 'No posts available right now.')}</p>
        </div>
      ) : (
        <div className="grid-layout">
          {discover.posts.map((post, i) => {
            let layoutClass = '';
            if (i % 10 === 2) layoutClass = 'tall right';
            else if (i % 10 === 5) layoutClass = 'tall left';

            return (
              <DiscoverPostCard
                key={post._id}
                post={post}
                layoutClass={layoutClass}
                onSeen={handleSeen}
              />
            );
          })}
        </div>
      )}

      {loadMore && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}
    </div>
  );
};

export default Discover;