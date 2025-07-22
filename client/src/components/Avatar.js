import React from 'react'

const Avatar = ({src, size, marginRight = 0}) => {
    
    return (
        <img src={src} alt="avatar" className={size}
        style={{marginRight: marginRight}} />
    )
}

export default Avatar