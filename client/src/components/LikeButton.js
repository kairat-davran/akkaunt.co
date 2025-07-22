import React from 'react'

const LikeButton = ({isLike, handleLike, handleUnLike}) => {
    return (
        <>
            {
                <span
                    className="material-icons"
                    onClick={isLike ? handleUnLike : handleLike}
                    title={isLike ? 'Unlike' : 'Like'}
                >
                    {isLike ? 'favorite' : 'favorite_border'}
                </span>
            }
        </>
    )
}

export default LikeButton