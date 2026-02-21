import { useState } from 'react';
import './InstallInstructions.css';

function InstallInstructions() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button type="button" className="install-hint-btn" onClick={() => setShow(true)} title="Install app">
        📲 Install App
      </button>
      {show && (
        <div className="install-overlay" onClick={() => setShow(false)}>
          <div className="install-modal" onClick={e => e.stopPropagation()}>
            <h2>Install Bethel Cell Leaders</h2>
            <p>Add this app to your home screen for quick access on your phone.</p>
            
            <div className="install-step">
              <h3>Android (Chrome)</h3>
              <ol>
                <li>Open this site in Chrome</li>
                <li>Tap the <strong>⋮</strong> menu (3 dots)</li>
                <li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong></li>
                <li>Confirm and the app icon will appear on your home screen</li>
              </ol>
            </div>

            <div className="install-step">
              <h3>iPhone / iPad (Safari)</h3>
              <ol>
                <li>Open this site in Safari (not Chrome)</li>
                <li>Tap the <strong>Share</strong> button (square with arrow)</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                <li>Tap <strong>Add</strong> — the app icon will appear on your home screen</li>
              </ol>
            </div>

            <button type="button" className="install-close" onClick={() => setShow(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

export default InstallInstructions;
