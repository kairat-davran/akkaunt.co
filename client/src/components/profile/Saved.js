import React, { useState, useEffect } from 'react'
import PostThumb from '../PostThumb'
import LoadMoreBtn from '../LoadMoreBtn'
import { getDataAPI } from '../../utils/fetchData'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'

const Saved = ({ auth, dispatch }) => {
  const [savePosts, setSavePosts] = useState([])
  const [result, setResult] = useState(0)
  const [page, setPage] = useState(1)
  const [load, setLoad] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setLoad(true)
      setInitialLoad(true)

      try {
        const res = await getDataAPI(`getSavePosts?limit=9&page=1`, auth.token)
        setSavePosts(res.data.savePosts)
        setResult(res.data.result)
      } catch (err) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: err.response?.data?.msg || 'Failed to load saved posts.' }
        })
      }

      setInitialLoad(false)
      setLoad(false)
    }

    fetchInitialPosts()
  }, [auth.token, dispatch])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setLoad(true)

    try {
      const res = await getDataAPI(`getSavePosts?limit=9&page=${nextPage}`, auth.token)
      setSavePosts(prev => [...prev, ...res.data.savePosts])
      setResult(res.data.result)
      setPage(nextPage)
    } catch (err) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: err.response?.data?.msg || 'Failed to load more saved posts.' }
      })
    }

    setLoad(false)
  }

  return (
    <>
      <PostThumb posts={savePosts} result={savePosts.length} initialLoad={initialLoad} />

      {load && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {result === 9 && (
        <LoadMoreBtn
          result={result}
          page={page}
          load={load}
          handleLoadMore={handleLoadMore}
        />
      )}
    </>
  )
}

export default Saved