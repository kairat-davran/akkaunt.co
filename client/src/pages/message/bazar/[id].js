import React, { useState, useEffect } from 'react';
import BazarLeftSide from '../../../components/message/BazarLeftSide';
import BazarRightSide from '../../../components/message/BazarRightSide';

const BazarConversation = () => {
  const [isLeftOpen, setIsLeftOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsLeftOpen(false);
    }
  }, []);

  return (
    <div className={`message d-flex ${isLeftOpen ? 'open-left' : ''}`}>
      <div className="col-md-4 border-right px-0 left_mess">
        <BazarLeftSide setIsLeftOpen={setIsLeftOpen} />
      </div>
      <div className="col-md-8 px-0 right_mess">
        <BazarRightSide setIsLeftOpen={setIsLeftOpen} />
      </div>
    </div>
  );
};

export default BazarConversation;