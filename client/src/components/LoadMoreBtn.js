import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadMoreBtn = ({ result, page, load, handleLoadMore }) => {
  const { t } = useTranslation();
  const showButton = result >= 9;

  return (
    <>
      {showButton && !load && (
        <button
          className="btn btn-dark mx-auto d-block my-3 px-4 py-2"
          onClick={handleLoadMore}
        >
          {t('load_more')}
        </button>
      )}
    </>
  );
};

export default LoadMoreBtn;