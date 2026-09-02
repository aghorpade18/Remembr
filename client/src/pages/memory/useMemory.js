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

export function useMemory(teamId, department) {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const activeRef = useRef(true);

    useEffect(() => {
        activeRef.current = true;
        return () => { activeRef.current = false; };
    }, []);

    const load = useCallback(async () => {
        if (!teamId || !department) {
            setMemories([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/memory/${encodeURIComponent(teamId)}?department=${encodeURIComponent(department)}`
            );
            if (!response.ok) throw new Error(await readError(response, 'Failed to load memory'));
            const data = await response.json();
            if (activeRef.current) setMemories(data);
        } catch (err) {
            if (activeRef.current) setError(err.message);
        } finally {
            if (activeRef.current) setLoading(false);
        }
    }, [teamId, department]);

    useEffect(() => { load(); }, [load]);

    // Sends free text (or a chat transcript) to the server, which asks OpenAI to pull out anything worth remembering.
    const generate = useCallback(async (text, messages) => {
        if ((!text || !text.trim()) && (!messages || messages.length === 0)) return [];
        if (!teamId || !department) return [];
        setGenerating(true);
        setError(null);
        try {
            const response = await fetch(`/api/memory/${encodeURIComponent(teamId)}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ department, text, messages })
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to generate memory'));
            const data = await response.json();
            const created = data.created || [];
            if (activeRef.current && created.length > 0) {
                setMemories((current) => {
                    const ids = new Set(created.map((m) => m._id));
                    return [...created, ...current.filter((m) => !ids.has(m._id))];
                });
            }
            return created;
        } catch (err) {
            if (activeRef.current) setError(err.message);
            throw err;
        } finally {
            if (activeRef.current) setGenerating(false);
        }
    }, [teamId, department]);

    const toggle = useCallback(async (memory) => {
        setError(null);
        try {
            const response = await fetch(`/api/memory/${memory._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !memory.enabled })
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to update memory'));
            const updated = await response.json();
            if (activeRef.current) {
                setMemories((current) => current.map((m) => (m._id === updated._id ? updated : m)));
            }
        } catch (err) {
            if (activeRef.current) setError(err.message);
        }
    }, []);

    const deleteMemory = useCallback(async (id) => {
        setError(null);
        try {
            const response = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(await readError(response, 'Delete failed'));
            if (activeRef.current) setMemories((current) => current.filter((m) => m._id !== id));
        } catch (err) {
            if (activeRef.current) setError(err.message);
        }
    }, []);

    return { memories, loading, generating, error, generate, toggle, deleteMemory, reload: load };
}
