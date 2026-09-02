import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import { MsalProvider } from '@azure/msal-react';
import { BrowserRouter } from 'react-router-dom';
import { app as teamsApp, authentication as teamsAuth } from '@microsoft/teams-js';
import { msalInstance, graphScopes, TEAMS_AUTH_FLAG, TEAMS_AUTH_SESSION_KEY } from './authConfig';
import App from './App';

function renderApp() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <MsalProvider instance={msalInstance}>
      <FluentProvider theme={teamsLightTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FluentProvider>
    </MsalProvider>
  );
}

// Handles the Teams-managed auth popup: kicks off the MSAL redirect, then returns the token to the tab.
async function runTeamsAuthPopup() {
  await msalInstance.initialize();
  const params = new URLSearchParams(window.location.search);

  if (params.get(TEAMS_AUTH_FLAG) === '1') {
    sessionStorage.setItem(TEAMS_AUTH_SESSION_KEY, '1');
    await msalInstance.loginRedirect({ scopes: graphScopes });
    return;
  }

  try {
    const response = await msalInstance.handleRedirectPromise();
    sessionStorage.removeItem(TEAMS_AUTH_SESSION_KEY);
    await teamsApp.initialize();
    if (response && response.accessToken) {
      teamsAuth.notifySuccess(JSON.stringify({ accessToken: response.accessToken, expiresOn: response.expiresOn }));
    } else {
      teamsAuth.notifyFailure('No token returned from sign-in');
    }
  } catch (err) {
    sessionStorage.removeItem(TEAMS_AUTH_SESSION_KEY);
    try { await teamsApp.initialize(); } catch { /* not in Teams */ }
    teamsAuth.notifyFailure(err.message || 'Sign-in failed');
  }
}

const inAuthPopup = new URLSearchParams(window.location.search).get(TEAMS_AUTH_FLAG) === '1'
  || sessionStorage.getItem(TEAMS_AUTH_SESSION_KEY) === '1';

if (inAuthPopup) {
  runTeamsAuthPopup();
} else {
  msalInstance.initialize().then(renderApp);
}
