import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  TabList, Tab, makeStyles, Title1, Dropdown, Option, Spinner, Text, Button
} from '@fluentui/react-components';
import {
  ShieldLock24Regular, DocumentAdd24Regular, PlugConnected24Regular, People24Regular
} from '@fluentui/react-icons';
import Permissions from './pages/Permissions';
import Skills from './pages/Skills';
import Integrations from './pages/Integrations';
import { getGraphToken } from './authConfig';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px',
    '@media (max-width: 600px)': { padding: '16px' }
  },
  headerRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '20px'
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
    float: 'right',
    '@media (max-width: 600px)': { minWidth: '100%' }
  },
  tabs: { marginBottom: '24px', overflowX: 'auto' },
  centered: { textAlign: 'center', padding: '40px', color: '#666' },
  error: { color: '#b10e1c' }
});

const TAB_ROUTES = [
  { value: '/', label: 'Permissions', icon: <ShieldLock24Regular /> },
  { value: '/skills', label: 'Skills', icon: <DocumentAdd24Regular /> },
  { value: '/integrations', label: 'Integrations', icon: <PlugConnected24Regular /> }
];

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
      const list = data.value || [];
      setTeams(list);
      if (list.length === 0) {
        setTeamError('No Teams are available for this account');
        setTeamId('');
        return;
      }
      const nextId = preferInternalId && list.some((team) => team.id === preferInternalId)
        ? preferInternalId
        : list[0].id;
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

  const selectedTeamName = teams.find((team) => team.id === teamId)?.displayName || '';

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <Title1>Admin Configuration</Title1>
      </div>

      <div className={styles.teamRow}>
        {/* <People24Regular /> */}
        {loadingTeams ? (
          <Spinner size="small" label="Loading teams..." />
        ) : teams.length > 0 ? (
          <Dropdown
            className={styles.teamDropdown}
            placeholder="Select a team"
            value={selectedTeamName}
            selectedOptions={teamId ? [teamId] : []}
            onOptionSelect={(_, data) => data.optionValue && setTeamId(data.optionValue)}
          >
            {teams.map((team) => (
              <Option key={team.id} value={team.id}>{team.displayName}</Option>
            ))}
          </Dropdown>
        ) : (
          <div className={styles.teamRow}>
            <Text className={styles.error}>{teamError || 'No teams available'}</Text>
            <Button size="small" onClick={() => loadTeams()}>Retry</Button>
          </div>
        )}
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

      {loadingTeams ? (
        <div className={styles.centered}>Loading team context...</div>
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
  );
}
