import React, { useState, useEffect } from 'react';
import BazarLeftSide from '../../components/message/BazarLeftSide';

const BazarMessage = () => {
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
      <div className="col-md-4 left_mess border-right px-0">
        <BazarLeftSide setIsLeftOpen={setIsLeftOpen} />
      </div>

      <div className="col-md-8 px-0 right_mess">
        {window.innerWidth > 768 && (
          <div className="text-center d-flex flex-column justify-content-center align-items-center h-100">
            <span className="material-icons" style={{ fontSize: '5rem' }}>storefront</span>
            <h4>Bazar Chat</h4>
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BazarMessage;