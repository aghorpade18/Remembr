import React, { useState, useEffect } from 'react';
import { Dropdown, Option, Spinner, makeStyles, Text, Button } from '@fluentui/react-components';
import { People24Regular } from '@fluentui/react-icons';
import { getGraphToken } from '../authConfig';
import { getTeamDisplayName } from '../utils/teamDisplay';

const useStyles = makeStyles({
  container: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  dropdown: { minWidth: '240px', maxWidth: '520px', flexGrow: 1, '@media (max-width: 600px)': { minWidth: '100%' } }
});

export default function TeamSelector({ selectedTeamId, onTeamSelect }) {
  const styles = useStyles();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getGraphToken();
      const res = await fetch('/api/graph/me/joinedTeams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      const teamList = data.value || [];
      setTeams(teamList);
      if (teamList.length > 0 && !selectedTeamId) {
        onTeamSelect(teamList[0].id, getTeamDisplayName(teamList[0]));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  if (loading) return <Spinner size="small" label="Loading teams from your organization..." />;

  if (error) {
    return (
      <div className={styles.container}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <Button onClick={fetchTeams}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <People24Regular />
      <Dropdown
        className={styles.dropdown}
        placeholder="Select a team"
        value={getTeamDisplayName(teams.find(t => t.id === selectedTeamId))}
        selectedOptions={selectedTeamId ? [selectedTeamId] : []}
        onOptionSelect={(_, data) => {
          const team = teams.find(t => t.id === data.optionValue);
          if (team) onTeamSelect(team.id, getTeamDisplayName(team));
        }}
      >
        {teams.map(t => (
          <Option key={t.id} value={t.id}>{getTeamDisplayName(t)}</Option>
        ))}
      </Dropdown>
    </div>
  );
}
