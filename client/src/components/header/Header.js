import React from 'react'
import { Link } from 'react-router-dom'
import Menu from './Menu'
import SearchHeader from './SearchHeader'

function Header() {
    

    return (
        <div className="header bg-light">
            <nav className="navbar navbar-expand-lg navbar-light bg-light justify-content-between align-middle">
                <Link to="/" className="logo">
                    <h1 className="navbar-brand p-0 m-0"
                    onClick={() => window.scrollTo({top: 0})}>akkaunt</h1>
                </Link>

                <SearchHeader />

                <Menu />
            </nav>
        </div>
    )
}

export default Header