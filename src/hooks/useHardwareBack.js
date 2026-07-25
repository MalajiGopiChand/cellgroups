import { useEffect, useRef } from 'react';

export function useHardwareBack(isOpen, closeCallback) {
  const isHardwareBackRef = useRef(false);
  const didPushRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modalOpen: true }, '');
      didPushRef.current = true;
      isHardwareBackRef.current = false;
    } else {
      // If it closed manually (not via hardware back) AND we had pushed a state
      if (didPushRef.current && !isHardwareBackRef.current) {
        window.history.back(); // Pop the dummy state
      }
      didPushRef.current = false;
      isHardwareBackRef.current = false;
    }

    const handlePopState = (e) => {
      if (isOpen) {
        isHardwareBackRef.current = true;
        closeCallback();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, closeCallback]);
}
