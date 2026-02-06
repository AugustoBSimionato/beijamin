import React, { StrictMode } from 'react' // Import React for UMD
import { createRoot } from 'react-dom/client'
import * as ReactDOM from 'react-dom'; // Import full ReactDOM for UMD

// Expose React/ReactDOM for UMD builds (like react-grid-layout)
window.React = React;
window.ReactDOM = ReactDOM;

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
