import React from 'react'

const LoadMoreBtn = ({ result, page, load, handleLoadMore }) => {
  const showButton = result >= 9;

  return (
    <>
      {showButton && !load && (
        <button
          className="btn btn-dark mx-auto d-block my-3 px-4 py-2"
          onClick={handleLoadMore}
        >
          Load More
        </button>
      )}
    </>
  )
}

export default LoadMoreBtn