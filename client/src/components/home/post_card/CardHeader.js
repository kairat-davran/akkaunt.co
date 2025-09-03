import React from 'react';
import Avatar from '../../Avatar';
import { Link, useNavigate } from 'react-router-dom';
import Moment from 'react-moment';
import 'moment/locale/ru';
import 'moment/locale/ky';
import { useDispatch, useSelector } from 'react-redux';
import { GLOBALTYPES } from '../../../redux/actions/globalTypes';
import { deletePost } from '../../../redux/actions/postAction';
import { BASE_URL } from '../../../utils/config';
import { useTranslation } from 'react-i18next';

const CardHeader = ({ post }) => {
  const { t, i18n } = useTranslation();
  const auth = useSelector(state => state.auth);
  const socket = useSelector(state => state.communication.socket);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEditPost = () => {
    dispatch({ type: GLOBALTYPES.STATUS, payload: { ...post, onEdit: true } });
  };

  const handleDeletePost = () => {
    if (window.confirm(t('confirm_delete_post'))) {
      dispatch(deletePost({ post, auth, socket }));
      navigate('/');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${BASE_URL}/post/${post._id}`);
  };

  return (
    <div className="card_header">
      <div className="d-flex">
        <Avatar src={post.user.avatar} size="big-avatar" marginRight={10} />
        <div className="card_name">
          <h6 className="m-0">
            <Link to={`/profile/id/${post.user._id}`} className="text-dark">
              {post.user.username}
            </Link>
          </h6>
          <small className="text-muted">
            <Moment fromNow locale={i18n.language}>
              {post.createdAt}
            </Moment>
          </small>
        </div>
      </div>

      <div className="nav-item dropdown">
        <span className="material-icons" id="moreLink" data-toggle="dropdown">
          more_horiz
        </span>

        <div className="dropdown-menu">
          {auth.user._id === post.user._id && (
            <>
              <div className="dropdown-item" onClick={handleEditPost}>
                <span className="material-icons">create</span> {t('edit_post')}
              </div>
              <div className="dropdown-item" onClick={handleDeletePost}>
                <span className="material-icons">delete_outline</span> {t('remove_post')}
              </div>
            </>
          )}

          <div className="dropdown-item" onClick={handleCopyLink}>
            <span className="material-icons">content_copy</span> {t('copy_link')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardHeader;