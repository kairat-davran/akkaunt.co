import React from 'react'
import Avatar from '../Avatar'
import { imageShow, videoShow } from '../../utils/mediaShow'
import { useSelector, useDispatch } from 'react-redux'
import { deleteMessages } from '../../redux/actions/messageAction'
import Times from './Times'

const MsgDisplay = ({user, msg, data}) => {
    const auth = useSelector(state => state.auth)
    const dispatch = useDispatch()

    const handleDeleteMessages = () => {
        if (!data || !msg._id) {
            console.warn("Message missing required data or _id");
            return;
        }

        if (window.confirm('Do you want to delete this message?')) {
            dispatch(deleteMessages({ msg, data, auth }));
        }
    };

    return (
        <>
            <div className="chat_title">
                <Avatar src={user.avatar} size="small-avatar" marginRight={"5px"} />
                <span>{user.username}</span>
            </div>

            <div className="you_content">
                { 
                    user._id === auth.user._id && 
                    <span
                        className="material-icons text-danger delete_icon"
                        onClick={handleDeleteMessages}
                        title="Delete message"
                    >
                    delete
                    </span>
                }

                <div>
                    {
                        msg.text && 
                        <div className="chat_text">
                            {msg.text}
                        </div>
                    }
                    {
                        msg.media.map((item, index) => (
                            <div key={index}>
                                {
                                    item.url.match(/video/i)
                                    ? videoShow(item.url)
                                    : imageShow(item.url)
                                }
                            </div>
                        ))
                    }
                </div>
            
                {
                    msg.call &&
                    <button className="btn d-flex align-items-center py-3 call_button">

                        <span className="material-icons font-weight-bold mr-1"
                        style={{ 
                            fontSize: '2.5rem', color: msg.call.times === 0 ? 'crimson' : 'green',
                        }}>
                            {
                                msg.call.times === 0
                                ? msg.call.video ? 'videocam_off' : 'phone_disabled'
                                : msg.call.video ? 'video_camera_front' : 'call'
                            }
                        </span>

                        <div className="text-left">
                            <h6>{msg.call.video ? 'Video Call' : 'Audio Call'}</h6>
                            <small>
                                {
                                    msg.call.times > 0 
                                    ? <Times total={msg.call.times} />
                                    : new Date(msg.createdAt).toLocaleTimeString()
                                }
                            </small>
                        </div>

                    </button>
                }
            
            </div>

            <div className="chat_time">
                {new Date(msg.createdAt).toLocaleString()}
            </div>
        </>
    )
}

export default MsgDisplay