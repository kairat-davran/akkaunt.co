import React from 'react';
import Status from '../components/home/Status';
import Posts from '../components/home/Posts';
import RightSideBar from '../components/home/RightSideBar';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const homePosts = useSelector(state => state.homePosts);
  const { t } = useTranslation();

  return (
    <div className="home row mx-0">
      <div className="col-md-8">
        <Status />

        {homePosts.loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : homePosts.result === 0 && homePosts.posts.length === 0 ? (
          <h2 className="text-center text-muted">{t('no_post')}</h2>
        ) : (
          <Posts />
        )}
      </div>

      <div className="col-md-4">
        <RightSideBar />
      </div>
    </div>
  );
};

export default Home;