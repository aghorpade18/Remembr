import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  TabList, Tab, makeStyles, Title1, Spinner
} from '@fluentui/react-components';
import {
  ShieldLock24Regular, DocumentAdd24Regular, PlugConnected24Regular
} from '@fluentui/react-icons';
import Permissions from './pages/Permissions';
import Skills from './pages/Skills';
import Integrations from './pages/Integrations';
import { getGraphToken } from './authConfig';
import { getTeamDisplayName } from './utils/teamDisplay';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    minHeight: '100vh',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 24px',
    '@media (max-width: 600px)': { padding: '20px 16px' }
  },
  headerRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0'
  },
  title: {
    color: '#242424',
    fontWeight: '600',
    fontSize: '28px',
    '@media (max-width: 600px)': { fontSize: '22px' }
  },
  teamPicker: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginLeft: 'auto'
  },
  teamDropdown: {
    minWidth: '240px',
    maxWidth: '360px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    '@media (max-width: 600px)': { minWidth: '100%' }
  },
  tabs: {
    marginBottom: '28px',
    overflowX: 'auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  content: {
    animation: 'fadeIn 0.2s ease-in-out'
  },
  centered: {
    textAlign: 'center',
    padding: '60px 20px 80px',
    color: '#666',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  error: { color: '#b10e1c', fontWeight: '500' }
});

const TAB_ROUTES = [
  { value: '/', label: 'Permissions & Configuration', icon: <ShieldLock24Regular /> },
  { value: '/skills', label: 'Skills', icon: <DocumentAdd24Regular /> },
  { value: '/integrations', label: 'Integrations', icon: <PlugConnected24Regular /> }
];

const DEFAULT_TEAM_NAMES = ['Team EDX', 'EDX'];

function isDefaultTeam(team) {
  const displayName = getTeamDisplayName(team).trim().toLowerCase();
  return DEFAULT_TEAM_NAMES.some((teamName) => teamName.toLowerCase() === displayName);
}

function moveDefaultTeamFirst(teams) {
  return [...teams].sort((first, second) => Number(isDefaultTeam(second)) - Number(isDefaultTeam(first)));
}

export default function App() {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamError, setTeamError] = useState('');

  const loadTeams = useMemo(() => async ({ preferInternalId } = {}) => {
    setLoadingTeams(true);
    setTeamError('');
    try {
      const token = await getGraphToken();
      const response = await fetch('/api/graph/me/joinedTeams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Unable to load your Teams');
      const data = await response.json();
      const list = moveDefaultTeamFirst(data.value || []);
      setTeams(list);
      if (list.length === 0) {
        setTeamError('No Teams are available for this account');
        setTeamId('');
        return;
      }
      const defaultTeam = list.find(isDefaultTeam);
      const nextId = defaultTeam?.id || (preferInternalId && list.some((team) => team.id === preferInternalId)
        ? preferInternalId
        : list[0].id);
      setTeamId((current) => current || nextId);
    } catch (err) {
      setTeamError(err.message);
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      let internalId;
      try {
        const { app } = require('@microsoft/teams-js');
        await app.initialize();
        const ctx = await app.getContext();
        internalId = ctx?.team?.internalId;
      } catch { }
      if (active) await loadTeams({ preferInternalId: internalId });
    })();
    return () => { active = false; };
  }, [loadTeams]);

  const selectedTeamName = getTeamDisplayName(teams.find((team) => team.id === teamId));

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <Title1 className={styles.title}>{selectedTeamName || 'Select a team'}</Title1>
      </div>

      <TabList
        className={styles.tabs}
        selectedValue={location.pathname}
        onTabSelect={(_, d) => navigate(d.value)}
      >
        {TAB_ROUTES.map((t) => (
          <Tab key={t.value} value={t.value} icon={t.icon}>{t.label}</Tab>
        ))}
      </TabList>

      <div className={styles.content}>
        {loadingTeams ? (
          <div className={styles.centered}>
            <Spinner size="large" label="Loading team context..." />
          </div>
        ) : teamId ? (
          <Routes>
            <Route path="/" element={<Permissions key={teamId} teamId={teamId} />} />
            <Route path="/skills" element={<Skills key={teamId} teamId={teamId} />} />
            <Route path="/integrations" element={<Integrations key={teamId} teamId={teamId} />} />
          </Routes>
        ) : (
          <div className={styles.centered}>{teamError || 'No team is selected.'}</div>
        )}
      </div>
    </div>
  );
}
