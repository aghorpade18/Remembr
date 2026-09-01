import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { MsalProvider } from '@azure/msal-react';
import { BrowserRouter } from 'react-router-dom';
import { msalInstance } from './authConfig';
import App from './App';

msalInstance.initialize().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <MsalProvider instance={msalInstance}>
      <FluentProvider theme={webLightTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FluentProvider>
    </MsalProvider>
  );
});
