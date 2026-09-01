const express = require('express');
const router = express.Router();

const normalizeDepartment = (department) => department?.trim() || 'Unassigned';

async function fetchGraphJson(url, authHeader) {
  const response = await fetch(url, { headers: { Authorization: authHeader } });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(body);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchGraphCollection(url, authHeader) {
  const values = [];
  let nextUrl = url;

  while (nextUrl) {
    const data = await fetchGraphJson(nextUrl, authHeader);
    values.push(...(data.value || []));
    nextUrl = data['@odata.nextLink'];
  }

  return values;
}

function toMemberProfile(user, fallback = {}) {
  const rawDepartment = user.department?.trim() || '';

  return {
    id: user.id || fallback.userId || fallback.id,
    displayName: user.displayName || fallback.displayName || user.userPrincipalName || fallback.email || user.id,
    mail: user.mail || fallback.email || null,
    userPrincipalName: user.userPrincipalName || null,
    department: normalizeDepartment(rawDepartment),
    departmentStatus: rawDepartment ? 'found' : 'missing'
  };
}

// Proxy Graph API calls – client passes user's access token in Authorization header.
router.get('/me/profile', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization token' });

    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me?$select=displayName,department,jobTitle,mail',
      { headers: { Authorization: authHeader } }
    );

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({ error: body });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/me/joinedTeams', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization token' });

    const response = await fetch('https://graph.microsoft.com/v1.0/me/joinedTeams', {
      headers: { Authorization: authHeader }
    });

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({ error: body });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/teams/:teamId/memberProfiles', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization token' });

    let groupMemberError = null;

    try {
      const groupMembers = await fetchGraphCollection(
        `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(req.params.teamId)}/members/microsoft.graph.user?$select=id,displayName,mail,userPrincipalName,department&$top=999`,
        authHeader
      );

      return res.json({
        source: 'groupMembers',
        value: groupMembers
          .map(user => ({ ...toMemberProfile(user), profileSource: 'groupMembers' }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
      });
    } catch (err) {
      groupMemberError = { status: err.status || 500, message: err.message };
    }

    const membersData = await fetchGraphJson(
      `https://graph.microsoft.com/v1.0/teams/${encodeURIComponent(req.params.teamId)}/members`,
      authHeader
    );

    const members = await Promise.all((membersData.value || []).map(async (member) => {
      const userId = member.userId || member.id;

      try {
        const user = await fetchGraphJson(
          `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userId)}?$select=id,displayName,mail,userPrincipalName,department`,
          authHeader
        );

        return { ...toMemberProfile(user, member), profileSource: 'users' };
      } catch (err) {
        return {
          id: userId,
          displayName: member.displayName || member.email || userId,
          mail: member.email || null,
          userPrincipalName: null,
          department: 'Unassigned',
          departmentStatus: 'lookupFailed',
          profileSource: 'teamsMembers',
          profileError: { status: err.status || 500, message: err.message }
        };
      }
    }));

    res.json({
      source: 'teamsMembersWithUserLookup',
      groupMemberError,
      value: members.sort((a, b) => a.displayName.localeCompare(b.displayName))
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// Get members of a specific team
router.get('/teams/:teamId/members', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization token' });

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${encodeURIComponent(req.params.teamId)}/members`,
      { headers: { Authorization: authHeader } }
    );

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({ error: body });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
