import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBazarConversations } from '../../redux/actions/bazarMessageAction';
import UserCard from '../UserCard';

const BazarLeftSide = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const { users = [] } = useSelector(state => state.bazarMessage);

  useEffect(() => {
    dispatch(getBazarConversations());
  }, [dispatch]);

  return (
    <>
      <div className="dm-header">
        <div className="dm-header-top">
          <span className="material-icons" onClick={() => navigate('/message')}>
            arrow_back
          </span>
          <span className="dm-username">{t('bazar')}</span>
        </div>
      </div>

      <div className="message_chat_list">
        {users.length === 0 && (
          <p className="text-center text-muted mt-4">{t('no_bazar_messages')}</p>
        )}

        {users.map(conv => (
          <div
            key={conv._id}
            className={`message_user ${id === conv._id ? 'active' : ''}`}
            onClick={() => navigate(`/message/sub/bazar/id/${conv._id}`)}
          >
            <UserCard user={conv} msg={true}>
              {conv.item?.images?.[0]?.url && (
                <img
                  src={conv.item.images[0].url}
                  alt="item"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginLeft: 8,
                  }}
                />
              )}
            </UserCard>
          </div>
        ))}
      </div>
    </>
  );
};

export default BazarLeftSide;