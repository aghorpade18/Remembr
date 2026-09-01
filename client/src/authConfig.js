import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AAD_CLIENT_ID || 'YOUR_CLIENT_ID',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AAD_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin
  },
  cache: { cacheLocation: 'sessionStorage' }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const graphScopes = [
  'User.Read',
  'User.Read.All',
  'Team.ReadBasic.All',
  'TeamMember.Read.All',
  'GroupMember.Read.All',
  'Directory.Read.All'
];

export async function getGraphToken() {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    const result = await msalInstance.loginPopup({ scopes: graphScopes });
    return result.accessToken;
  }
  try {
    const result = await msalInstance.acquireTokenSilent({ scopes: graphScopes, account: accounts[0] });
    return result.accessToken;
  } catch {
    const result = await msalInstance.acquireTokenPopup({ scopes: graphScopes });
    return result.accessToken;
  }
}
