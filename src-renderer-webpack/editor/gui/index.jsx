import React from 'react';
import ReactDOM from 'react-dom';
import GUI from './gui.jsx';

import './media-device-chooser-impl.js';
import '../prompt/prompt.js';

const appTarget = document.getElementById('app');
GUI.setAppElement(appTarget);

ReactDOM.render(<GUI />, appTarget);

try {
    if (window.SplashEnd) {
        setTimeout(() => window.SplashEnd(), 0);
    } else {
        document.body.classList.add('tw-loaded');
    }
} catch (e) {
    document.body.classList.add('tw-loaded');
}

require('./addons');

EditorPreload.getAdvancedCustomizations().then(({userscript, userstyle}) => {
  if (userstyle) {
    const style = document.createElement('style');
    style.textContent = userstyle;
    document.body.appendChild(style);
  }

  if (userscript) {
    const script = document.createElement('script');
    script.textContent = userscript;
    document.body.appendChild(script);
  }
});
