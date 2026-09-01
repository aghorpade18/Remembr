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

export function useSkills(teamId, department) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const activeRef = useRef(true);

    useEffect(() => {
        activeRef.current = true;
        return () => { activeRef.current = false; };
    }, []);

    const load = useCallback(async () => {
        if (!teamId || !department) {
            setSkills([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/skills/${encodeURIComponent(teamId)}?department=${encodeURIComponent(department)}`
            );
            if (!response.ok) throw new Error(await readError(response, 'Failed to load skills'));
            const data = await response.json();
            if (activeRef.current) setSkills(data);
        } catch (err) {
            if (activeRef.current) setError(err.message);
        } finally {
            if (activeRef.current) setLoading(false);
        }
    }, [teamId, department]);

    useEffect(() => { load(); }, [load]);

    const upload = useCallback(async (file) => {
        if (!file || !teamId || !department) return;
        setError(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('department', department);
        try {
            const response = await fetch(`/api/skills/${encodeURIComponent(teamId)}/upload`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error(await readError(response, 'Upload failed'));
            const saved = await response.json();
            if (activeRef.current) setSkills((current) => [saved, ...current]);
        } catch (err) {
            if (activeRef.current) setError(err.message);
            throw err;
        }
    }, [teamId, department]);

    const changeStatus = useCallback(async (skill, status) => {
        setError(null);
        try {
            const response = await fetch(`/api/skills/${skill._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to change status'));
            const updated = await response.json();
            if (!activeRef.current) return;
            setSkills((current) => current.map((entry) => {
                if (entry._id === updated._id) return updated;
                if (status === 'active'
                    && entry.status === 'active'
                    && entry.teamId === updated.teamId
                    && entry.department === updated.department) {
                    return { ...entry, status: 'inactive' };
                }
                return entry;
            }));
        } catch (err) {
            if (activeRef.current) setError(err.message);
        }
    }, []);

    const deleteSkill = useCallback(async (id) => {
        setError(null);
        try {
            const response = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(await readError(response, 'Delete failed'));
            if (activeRef.current) setSkills((current) => current.filter((s) => s._id !== id));
        } catch (err) {
            if (activeRef.current) setError(err.message);
        }
    }, []);

    return { skills, loading, error, upload, changeStatus, deleteSkill, refresh: load };
}
