import React from 'react'
import { useSelector } from 'react-redux'

const Avatar = ({src, size, marginRight = 0}) => {
    const theme = useSelector(state => state.theme)
    
    return (
        <img src={src} alt="avatar" className={size}
        style={{filter: `${theme ? 'invert(1)' : 'invert(0)'}`, marginRight: marginRight}} />
    )
}

export default Avatar