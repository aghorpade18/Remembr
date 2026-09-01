import { useCallback, useEffect, useRef, useState } from 'react';

async function readError(response, fallback) {
    try {
        const data = await response.clone().json();
        if (data.error) return data.error;
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            return data.errors.map(e => e.msg || e.message).filter(Boolean).join(', ') || fallback;
        }
    } catch { }
    return fallback;
}

export function useIntegrations(teamId, department) {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState(null);
    const activeRef = useRef(true);

    useEffect(() => {
        activeRef.current = true;
        return () => { activeRef.current = false; };
    }, []);

    const load = useCallback(async () => {
        if (!teamId || !department) {
            setIntegrations([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/integrations/${encodeURIComponent(teamId)}?department=${encodeURIComponent(department)}`
            );
            if (!response.ok) throw new Error(await readError(response, 'Failed to load integrations'));
            const data = await response.json();
            if (activeRef.current) setIntegrations(data);
        } catch (err) {
            if (activeRef.current) setError(err.message);
        } finally {
            if (activeRef.current) setLoading(false);
        }
    }, [teamId, department]);

    useEffect(() => { load(); }, [load]);

    const updateIntegration = useCallback(async (integration, updates) => {
        setSavingId(integration._id);
        setError(null);
        setIntegrations((current) => current.map((entry) => (
            entry._id === integration._id ? { ...entry, ...updates } : entry
        )));
        try {
            const response = await fetch(`/api/integrations/${integration._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to update integration'));
            const saved = await response.json();
            if (activeRef.current) {
                setIntegrations((current) => current.map((entry) => (
                    entry._id === integration._id ? saved : entry
                )));
            }
        } catch (err) {
            if (activeRef.current) {
                setIntegrations((current) => current.map((entry) => (
                    entry._id === integration._id ? integration : entry
                )));
                setError(err.message);
            }
        } finally {
            if (activeRef.current) setSavingId(null);
        }
    }, []);

    return { integrations, loading, savingId, error, updateIntegration, refresh: load };
}
