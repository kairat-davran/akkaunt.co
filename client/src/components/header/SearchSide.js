import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import UserCard from '../UserCard';
import { getUsers } from '../../redux/actions/profileAction';

const SearchSide = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const { users } = useSelector(state => state.profile);

  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchKeyword.trim()) {
      dispatch(getUsers(auth.token, searchKeyword.trim()));
    }
  }, [dispatch, auth.token, searchKeyword]);

  const handleClose = () => {
      setSearchKeyword('');
      dispatch(getUsers(auth.token, ''));
  }

  return (
    <form className="search-panel">
      <input
        type="text"
        name="search"
        value={searchKeyword}
        id="search"
        className="search-panel__input"
        title="Enter to Search"
        onChange={e => setSearchKeyword(e.target.value.toLowerCase().replace(/ /g, ''))}
      />

      <div className="search-panel__icon" style={{ opacity: searchKeyword ? 0 : 0.3 }}>
        <span className="material-icons">search</span>
        <span>Enter to Search</span>
      </div>

      <div
        className="search-panel__close"
        onClick={handleClose}
        style={{ opacity: users.length === 0 ? 0 : 1 }}
      >
        &times;
      </div>

      <div className="search-panel__results">
        {searchKeyword && users.map(user => (
          <UserCard
            key={user._id}
            user={user}
            border="border"
            handleClose={handleClose}
          />
        ))}
      </div>
    </form>
  )
}

export default SearchSide