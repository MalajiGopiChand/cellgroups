import React, { useEffect, useRef } from 'react';
import { Typography } from '@mui/material';

const SplitText = ({ text, delay = 0, duration = 0.5, ...props }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Basic animation logic for SplitText without heavy dependencies
    const chars = containerRef.current.querySelectorAll('.split-char');
    chars.forEach((char, index) => {
      char.style.opacity = '0';
      char.style.transform = 'translateY(10px)';
      char.style.transition = `opacity ${duration}s ease ${delay + index * 0.05}s, transform ${duration}s ease ${delay + index * 0.05}s`;
      
      // Trigger reflow
      void char.offsetWidth;
      
      char.style.opacity = '1';
      char.style.transform = 'translateY(0)';
    });
  }, [text, delay, duration]);

  return (
    <Typography ref={containerRef} {...props} sx={{ display: 'inline-block', ...props.sx }}>
      {text.split('').map((char, index) => (
        <span 
          key={index} 
          className="split-char" 
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ))}
    </Typography>
  );
};

export default SplitText;
