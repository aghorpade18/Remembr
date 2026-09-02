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
async function runTeamsAuthPopup(isStart) {
  await msalInstance.initialize();

  if (isStart) {
    sessionStorage.setItem(TEAMS_AUTH_SESSION_KEY, '1');
    await msalInstance.loginRedirect({ scopes: graphScopes, redirectUri: window.location.origin });
    return;
  }

  try {
    let response = await msalInstance.handleRedirectPromise();
    sessionStorage.removeItem(TEAMS_AUTH_SESSION_KEY);

    // Fall back to the freshly-cached account if the redirect response was already consumed.
    let accessToken = response && response.accessToken;
    let expiresOn = response && response.expiresOn;
    if (!accessToken) {
      const account = msalInstance.getAllAccounts()[0];
      if (account) {
        const silent = await msalInstance.acquireTokenSilent({ scopes: graphScopes, account });
        accessToken = silent.accessToken;
        expiresOn = silent.expiresOn;
      }
    }

    const inTeams = await initTeams();
    if (!inTeams) { renderApp(); return; }

    if (accessToken) {
      teamsAuth.notifySuccess(JSON.stringify({ accessToken, expiresOn }));
    } else {
      teamsAuth.notifyFailure('No token returned from sign-in');
    }
  } catch (err) {
    sessionStorage.removeItem(TEAMS_AUTH_SESSION_KEY);
    const inTeams = await initTeams();
    if (inTeams) teamsAuth.notifyFailure(err.message || 'Sign-in failed');
    else renderApp();
  }
}

// Initializes Teams with a timeout so a non-Teams window never hangs on a white screen.
function initTeams() {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => { if (!settled) { settled = true; resolve(value); } };
    const timer = setTimeout(() => done(false), 2500);
    teamsApp.initialize().then(() => { clearTimeout(timer); done(true); }).catch(() => { clearTimeout(timer); done(false); });
  });
}

const search = new URLSearchParams(window.location.search);
const hash = window.location.hash || '';
const isStart = search.get(TEAMS_AUTH_FLAG) === '1';
const hasAuthResponse = /[#&?](code|error|id_token|access_token|state)=/.test(hash);
const hasSessionFlag = sessionStorage.getItem(TEAMS_AUTH_SESSION_KEY) === '1';
const isTopLevelWindow = window.top === window.self;

// Auth popup when starting the flow, or completing a redirect (session flag, or response in a top-level window).
const inAuthPopup = isStart || hasSessionFlag || (hasAuthResponse && isTopLevelWindow);

if (inAuthPopup) {
  runTeamsAuthPopup(isStart);
} else {
  msalInstance.initialize().then(renderApp);
}
