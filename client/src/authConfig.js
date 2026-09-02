import { PublicClientApplication } from '@azure/msal-browser';
import { app as teamsApp, authentication as teamsAuth } from '@microsoft/teams-js';

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AAD_CLIENT_ID || 'YOUR_CLIENT_ID',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AAD_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin
  },
  // localStorage so the Teams auth popup and the tab share MSAL state on the same origin.
  cache: { cacheLocation: 'localStorage' }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const graphScopes = [
  'User.Read',
  'User.Read.All',
  'Team.ReadBasic.All',
  'Channel.ReadBasic.All',
  'Chat.ReadBasic',
  'TeamMember.Read.All',
  'GroupMember.Read.All',
  'Directory.Read.All'
];

// Query flag used to drive the redirect flow inside the Teams-managed auth popup.
export const TEAMS_AUTH_FLAG = 'teamsAuth';
export const TEAMS_AUTH_SESSION_KEY = 'msalTeamsRedirect';

let cachedToken = null;
let inTeamsPromise;

function cache(result) {
  const exp = result.expiresOn ? new Date(result.expiresOn).getTime() : Date.now() + 3300 * 1000;
  cachedToken = { token: result.accessToken, exp };
  return result.accessToken;
}

// Resolves true only when running inside the Microsoft Teams host, with a timeout so plain browsers don't hang.
function isInTeams() {
  if (inTeamsPromise === undefined) {
    inTeamsPromise = new Promise((resolve) => {
      let settled = false;
      const done = (value) => { if (!settled) { settled = true; resolve(value); } };
      const timer = setTimeout(() => done(false), 2000);
      teamsApp.initialize()
        .then(() => teamsApp.getContext())
        .then((ctx) => { clearTimeout(timer); done(!!ctx); })
        .catch(() => { clearTimeout(timer); done(false); });
    });
  }
  return inTeamsPromise;
}

export async function getGraphToken() {
  if (cachedToken && cachedToken.exp - Date.now() > 60 * 1000) return cachedToken.token;

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    try {
      const result = await msalInstance.acquireTokenSilent({ scopes: graphScopes, account: accounts[0] });
      return cache(result);
    } catch {
      // fall through to interactive
    }
  }

  // Inside Teams, browser popups are blocked; use the Teams-managed auth popup instead.
  if (await isInTeams()) {
    const url = `${window.location.origin}/?${TEAMS_AUTH_FLAG}=1`;
    const raw = await teamsAuth.authenticate({ url, width: 600, height: 535 });
    const parsed = JSON.parse(raw);
    return cache(parsed);
  }

  try {
    const result = await msalInstance.loginPopup({ scopes: graphScopes });
    return cache(result);
  } catch {
    const result = await msalInstance.acquireTokenPopup({ scopes: graphScopes });
    return cache(result);
  }
}
