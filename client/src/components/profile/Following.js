import React from 'react'
import FollowBtn from '../FollowBtn'
import { useSelector } from 'react-redux'
import UserCard from '../UserCard'

const Following = ({users, setShowFollowing}) => {
    const auth = useSelector(state => state.auth)
    return (
        <div className="follow">
            <div className="follow_box">
                <h5 className="text-center">Following</h5>
                <hr />
                {
                    users.map(user => (
                        <UserCard key={user._id} user={user} setShowFollowing={setShowFollowing} >
                            {
                                auth.user._id !== user._id && <FollowBtn user={user} />
                            }
                        </UserCard>
                    ))
                }

                <span className="followers_close" onClick={() => setShowFollowing(false)}>
                    &times;
                </span>
            </div>
        </div>
    )
}

export default Following