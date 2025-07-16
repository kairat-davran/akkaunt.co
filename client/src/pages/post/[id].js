import React, { useEffect, useState } from 'react'
import { getPost } from '../../redux/actions/postAction'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PostCard from '../../components/PostCard'

const Post = () => {
    const { id } = useParams()
    const [post, setPost] = useState([])

    const auth = useSelector(state => state.auth)
    const detailPost = useSelector(state => state.detailPost)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getPost({detailPost, id, auth}))

        if(detailPost.length > 0){
            const newArr = detailPost.filter(post => post._id === id)
            setPost(newArr)
        }
    },[detailPost, dispatch, id, auth])

    return (
        <div className='posts'>
            {
                post.length === 0 &&
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            }

            {
                 post.map(item => (
                    <PostCard key={item._id} post={item} />
                ))
            }
        </div>
    )
}

export default Post