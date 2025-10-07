import React, { useState } from 'react';
import '../css/Accordion.css';

const Accordion = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion-item">
      <button className={`accordion-title ${isOpen ? 'active' : ''}`} onClick={toggleAccordion}>
        {title}
        <span className="icon">{isOpen ? '−' : '+'}</span>
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="accordion-body">{content}</div>
      </div>
    </div>
  );
};

export default Accordion;
