import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import UserCard from '../UserCard';
import FollowBtn from '../FollowBtn';
import { getSuggestions } from '../../redux/actions/suggestionsAction';
import { useTranslation } from 'react-i18next';

const RightSideBar = () => {
  const auth = useSelector(state => state.auth);
  const suggestions = useSelector(state => state.suggestions);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div className="mt-3">
      <UserCard user={auth.user} />

      <div className="d-flex justify-content-between align-items-center my-2">
        <h5 className="text-danger">{t('suggestions_title')}</h5>
        {!suggestions.loading && (
          <i
            className="fas fa-redo"
            style={{ cursor: 'pointer' }}
            onClick={() => dispatch(getSuggestions(auth.token))}
          />
        )}
      </div>

      {suggestions.loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="suggestions">
          {suggestions.users.map(user => (
            <UserCard key={user._id} user={user}>
              <FollowBtn user={user} />
            </UserCard>
          ))}
        </div>
      )}

      <div style={{ opacity: 0.5 }} className="my-2">
        <Link to="/about" style={{ wordBreak: 'break-all' }}>
          {t('footer_link_text')}
        </Link>
        <small className="d-block">{t('footer_message')}</small>
        <small>&copy; 2025 akkaunt {t('footer_from')}</small>
      </div>
    </div>
  );
};

export default RightSideBar;