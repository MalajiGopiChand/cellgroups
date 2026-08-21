/**
 * Utility for triggering native mobile haptic feedback (vibrations).
 * Safely checks if the navigator.vibrate API is supported before executing.
 */

export const triggerHaptic = (type = 'light') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        // A very short, soft tap
        window.navigator.vibrate(10);
        break;
      case 'medium':
        // A slightly stronger tap
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        // A heavy tap (e.g. for errors or important actions)
        window.navigator.vibrate(30);
        break;
      case 'success':
        // Two quick taps
        window.navigator.vibrate([15, 50, 15]);
        break;
      case 'error':
        // Three quick taps
        window.navigator.vibrate([20, 50, 20, 50, 20]);
        break;
      default:
        window.navigator.vibrate(15);
    }
  } catch (error) {
    // Ignore errors (some browsers strictly block vibrations)
    console.warn('Haptics failed:', error);
  }
};
