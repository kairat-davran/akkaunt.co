import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PostCard from '../PostCard'

import LoadMoreBtn from '../LoadMoreBtn'
import { getDataAPI } from '../../utils/fetchData'
import { POST_TYPES } from '../../redux/actions/postAction'

const Posts = () => {
    const homePosts = useSelector(state => state.homePosts || {
        posts: [],
        result: 0,
        page: 1,
    });
    const auth = useSelector(state => state.auth)
    const dispatch = useDispatch()

    const [load, setLoad] = useState(false)

    const handleLoadMore = async () => {
        setLoad(true)
        const res = await getDataAPI(`posts?limit=${homePosts.page * 9}`, auth.token)
        
        dispatch({
            type: POST_TYPES.GET_POSTS,
            payload: {...res.data, page: homePosts.page + 1}
        })
        
        setLoad(false)
    }
    
    return (
        <div className="posts">
            {
                homePosts.posts.map(post => (
                    <PostCard key={post._id} post={post} />
                ))
            }

            {
                load && <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                        </div>
            }

            
            <LoadMoreBtn result={homePosts.result} page={homePosts.page}
            load={load} handleLoadMore={handleLoadMore} />
        </div>
    )
}

export default Posts