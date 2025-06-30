import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getSavedPosts } from '../../redux/actions/postAction';
import PostThumb from '../PostThumb';
import LoadMoreBtn from '../LoadMoreBtn';
import LoadIcon from '../../assets/images/loading.gif';

const Saved = ({ auth }) => {
  const dispatch = useDispatch();
  const { saved, savedPage, savedResult } = useSelector(state => state.posts);
  const [load, setLoad] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (saved.length === 0) {
        setLoad(true);
        await dispatch(getSavedPosts(auth.token, 1, 9));
      }
      setInitialLoad(false);
      setLoad(false);
    };

    loadData();
  }, [auth.token]);

  const handleLoadMore = async () => {
    setLoad(true);
    await dispatch(getSavedPosts(auth.token, savedPage + 1, 9));
    setLoad(false);
  };

  return (
    <View style={styles.wrapper}>
      {initialLoad ? (
        <Image source={LoadIcon} style={styles.loading} resizeMode="contain" />
      ) : (
        <>
          <PostThumb posts={saved} result={savedResult} />
          {load && (
            <Image source={LoadIcon} style={styles.loading} resizeMode="contain" />
          )}
          <LoadMoreBtn
            result={savedResult}
            page={savedPage}
            load={load}
            handleLoadMore={handleLoadMore}
          />
        </>
      )}
    </View>
  );
};

export default Saved;

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
  loading: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginVertical: 20,
  },
});