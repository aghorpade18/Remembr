import { useCallback, useEffect, useRef, useState } from 'react';
import { getGraphToken } from '../authConfig';

const UNASSIGNED = 'Unassigned';

function normalize(department) {
    return department?.trim() || UNASSIGNED;
}

export function useTeamDepartments(teamId) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const activeRef = useRef(true);

    useEffect(() => {
        activeRef.current = true;
        return () => { activeRef.current = false; };
    }, []);

    const load = useCallback(async () => {
        if (!teamId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const token = await getGraphToken();
            const response = await fetch(`/api/graph/teams/${encodeURIComponent(teamId)}/memberProfiles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to load departments');
            const data = await response.json();
            const set = new Set();
            for (const member of data.value || []) {
                if (member.department) set.add(normalize(member.department));
            }
            if (activeRef.current) setDepartments([...set].sort((a, b) => a.localeCompare(b)));
        } catch (err) {
            if (activeRef.current) setError(err.message);
        } finally {
            if (activeRef.current) setLoading(false);
        }
    }, [teamId]);

    useEffect(() => { load(); }, [load]);

    return { departments, loading, error, refetch: load };
}
