import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'react-i18next';
import MsgDisplay from '../../components/message/MsgDisplay';
import UserCard from '../../components/UserCard';
import Icons from '../../components/Icons';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { imageShow, videoShow } from '../../utils/mediaShow';
import { imageUpload } from '../../utils/imageUpload';
import {
  sendBazarMessage,
  getBazarMessages,
  deleteBazarConversation,
  deleteBazarMessage,
  loadMoreBazarMessages,
} from '../../redux/actions/bazarMessageAction';

const BazarRightSide = () => {
  const { t } = useTranslation();
  const auth = useSelector(state => state.auth);
  const bazarMessage = useSelector(state => state.bazarMessage);
  const socket = useSelector(state => state.communication.socket);
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const refDisplay = useRef();
  const pageEnd = useRef();

  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [loadMedia, setLoadMedia] = useState(false);
  const [data, setData] = useState([]);
  const [user, setUser] = useState([]);
  const [result, setResult] = useState(9);
  const [page, setPage] = useState(0);
  const [isLoadMore, setIsLoadMore] = useState(0);

  useEffect(() => {
    const newData = bazarMessage.data.find(item => item._id === id);
    if (newData) {
      setData(newData.messages);
      setResult(newData.result);
      setPage(newData.page);
    }
  }, [bazarMessage.data, id]);

  useEffect(() => {
    if (id && bazarMessage.users.length > 0) {
      setTimeout(() => {
        refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);

      const newUser = bazarMessage.users.find(user => user._id === id);
      if (newUser) setUser(newUser);
    }
  }, [bazarMessage.users, id]);

  useEffect(() => {
    const getMessagesData = async () => {
      if (!id) return;

      if (bazarMessage.data.every(item => item._id !== id)) {
        await dispatch(getBazarMessages({ auth, id }));
        setTimeout(() => {
          if (refDisplay.current) {
            refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }, 50);
      }
    };
    getMessagesData();
  }, [id, dispatch, auth, bazarMessage.data]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsLoadMore(p => p + 1);
      }
    }, {
      threshold: 0.1
    });
    observer.observe(pageEnd.current);
  }, [setIsLoadMore]);

  useEffect(() => {
    if (isLoadMore > 1) {
      if (result >= page * 9) {
        dispatch(loadMoreBazarMessages({ convId: id, page: page + 1 }));
        setIsLoadMore(1);
      }
    }
  }, [isLoadMore, dispatch, auth, id, page, result]);

  const handleChangeMedia = async (e) => {
    const files = [...e.target.files];
    let err = '';
    let newMedia = [];

    for (const file of files) {
      if (!file) {
        err = 'File does not exist.';
        continue;
      }
      if (file.size > 1024 * 1024 * 20) {
        err = 'Max size 20MB.';
        continue;
      }

      try {
        if (file.type.startsWith('image/')) {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          newMedia.push(compressedFile);
        } else {
          newMedia.push(file);
        }
      } catch (error) {
        err = 'Image compression failed.';
      }
    }
    if (err) dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err } });
    setMedia(prev => [...prev, ...newMedia]);
  };

  const handleDeleteMedia = (index) => {
    const newArr = [...media];
    newArr.splice(index, 1);
    setMedia(newArr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && media.length === 0) return;
    setText('');
    setMedia([]);
    setLoadMedia(true);

    let newArr = [];
    if (media.length > 0) newArr = await imageUpload(media, auth.token);

    const msg = {
      conversation: id,
      sender: auth.user,
      recipient: user._id,
      text,
      media: newArr,
      createdAt: new Date().toISOString()
    };

    setLoadMedia(false);
    await dispatch(sendBazarMessage({ msg, auth, socket }));

    if (refDisplay.current) {
      refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const handleDeleteMessages = ({ msg, data, auth }) => {
    dispatch(deleteBazarMessage({ msg, data, auth }));
  };

  const handleDeleteConversation = () => {
    if (window.confirm(t('confirm_delete'))) {
      dispatch(deleteBazarConversation({auth, convId: id, navigate }));
    }
  };

  return (
    <>
      <div className="message_header">
        {window.innerWidth <= 768 && (
          <span className="dm-back-btn" onClick={() => navigate('/message/sub/bazar')}>
            <span className="material-icons">arrow_back</span>
          </span>
        )}
        {user && <UserCard user={user}>
          <span className="material-icons text-danger" onClick={handleDeleteConversation}>delete</span>
        </UserCard>}
      </div>

      <div className="chat_container" style={{ height: media.length > 0 ? 'calc(100% - 180px)' : '' }}>
        <div className="chat_display" ref={refDisplay}>
          <button style={{ marginTop: '-25px', opacity: 0 }} ref={pageEnd}>Load more</button>
          {data.map((msg, index) => (
            <div key={index}>
              {msg.sender._id !== auth.user._id ? (
                <div className="chat_row other_message">
                  <MsgDisplay user={user} msg={msg} />
                </div>
              ) : (
                <div className="chat_row you_message">
                  <MsgDisplay user={auth.user} msg={msg} data={data} handleDelete={handleDeleteMessages} />
                </div>
              )}
            </div>
          ))}

          {loadMedia && (
            <div className="chat_row you_message">
              <div className="text-center py-5">
                <div className="text-center text-muted mt-2">{t('sending')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="show_media" style={{ display: media.length > 0 ? 'grid' : 'none' }}>
        {media.map((item, index) => (
          <div key={index} id="file_media">
            {item.type.match(/video/i)
              ? videoShow(URL.createObjectURL(item))
              : imageShow(URL.createObjectURL(item))}
            <span onClick={() => handleDeleteMedia(index)}>&times;</span>
          </div>
        ))}
      </div>

      <form className="chat_input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t('enter_message')}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Icons setContent={setText} content={text} />

        <div className="file_upload">
          <span className="material-icons text-danger">image</span>
          <input
            type="file"
            name="file"
            id="file"
            multiple
            accept="image/*,video/*"
            onChange={handleChangeMedia}
          />
        </div>

        <button
          type="submit"
          className="material-icons"
          disabled={!text && media.length === 0}
        >
          near_me
        </button>
      </form>
    </>
  );
};

export default BazarRightSide;