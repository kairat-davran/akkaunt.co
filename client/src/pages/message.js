import React, { useState, useEffect } from 'react';
import LeftSide from '../components/message/LeftSide';
import { useTranslation } from 'react-i18next';

const Message = () => {
  const { t } = useTranslation();
  const [isLeftOpen, setIsLeftOpen] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsLeftOpen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`message d-flex ${isLeftOpen ? 'open-left' : ''}`}>
      <div className="col-md-4 border-right px-0 left_mess">
        <LeftSide setIsLeftOpen={setIsLeftOpen} />
      </div>

      <div className="col-md-8 px-0 right_mess">
        {window.innerWidth > 768 && (
          <div className="d-flex justify-content-center align-items-center flex-column h-100">
            <span className="material-icons" style={{ fontSize: '5rem' }}>forum</span>
            <h4>{t('messenger')}</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;