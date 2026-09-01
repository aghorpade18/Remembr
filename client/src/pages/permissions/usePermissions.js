import { useCallback, useEffect, useRef, useState } from 'react';
import { getGraphToken } from '../../authConfig';
import {
    createDraftRow,
    filterMembersByDepartment,
    getErrorMessage,
    isDraftRow,
    normalizeDepartment,
    sortByName,
    toStoredMember,
    toStoredMembers
} from './utils';

async function fetchPermissions(teamId) {
    const response = await fetch(`/api/permissions/${encodeURIComponent(teamId)}`);
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to load permissions'));
    return response.json();
}

async function fetchMemberProfiles(teamId) {
    const token = await getGraphToken();
    const response = await fetch(`/api/graph/teams/${encodeURIComponent(teamId)}/memberProfiles`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to load team members'));
    const data = await response.json();
    return (data.value || []).map(member => ({
        ...member,
        department: normalizeDepartment(member.department)
    }));
}

export function usePermissions(teamId) {
    const [rows, setRows] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState(null);

    const activeRef = useRef(true);
    const creatingRef = useRef(new Set());

    useEffect(() => {
        activeRef.current = true;
        return () => { activeRef.current = false; };
    }, []);

    const safeSet = useCallback((setter) => (value) => {
        if (activeRef.current) setter(value);
    }, []);

    const load = useCallback(async () => {
        if (!teamId) {
            safeSet(setLoading)(false);
            return;
        }

        safeSet(setLoading)(true);
        safeSet(setError)(null);

        try {
            const [permissions, memberProfiles] = await Promise.all([
                fetchPermissions(teamId),
                fetchMemberProfiles(teamId)
            ]);
            safeSet(setRows)(permissions);
            safeSet(setMembers)(memberProfiles);
        } catch (err) {
            safeSet(setError)(err.message);
        } finally {
            safeSet(setLoading)(false);
        }
    }, [teamId, safeSet]);

    useEffect(() => { load(); }, [load]);

    const addDraftRow = useCallback(() => {
        safeSet(setError)(null);
        safeSet(setRows)((current) => [...current, createDraftRow(teamId)]);
    }, [safeSet, teamId]);

    const removeDraftRow = useCallback((rowId) => {
        safeSet(setRows)((current) => current.filter((row) => row._id !== rowId));
    }, [safeSet]);

    const saveDraftRow = useCallback(async (draftRow, department) => {
        if (creatingRef.current.has(draftRow._id)) return;
        creatingRef.current.add(draftRow._id);

        safeSet(setSavingId)(draftRow._id);
        safeSet(setError)(null);
        safeSet(setRows)((current) => current.map((row) => (
            row._id === draftRow._id ? { ...row, department } : row
        )));

        try {
            const latestMembers = await fetchMemberProfiles(teamId);
            safeSet(setMembers)(latestMembers);

            const departmentMembers = toStoredMembers(filterMembersByDepartment(latestMembers, department));
            const response = await fetch('/api/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    teamName: teamId,
                    department,
                    members: departmentMembers,
                    enabled: true
                })
            });

            if (response.status === 409) {
                safeSet(setRows)((current) => current.filter((row) => row._id !== draftRow._id));
                safeSet(setError)(`A permission row for "${department}" already exists. Reloaded the latest rows so you can edit it.`);
                try {
                    const freshRows = await fetchPermissions(teamId);
                    safeSet(setRows)(freshRows);
                } catch { }
                return;
            }

            if (!response.ok) {
                throw new Error(await getErrorMessage(response, 'Failed to add permission row'));
            }

            const savedRow = await response.json();
            safeSet(setRows)((current) => current.map((row) => (
                row._id === draftRow._id ? savedRow : row
            )));
        } catch (err) {
            safeSet(setRows)((current) => current.map((row) => (
                row._id === draftRow._id ? { ...row, department: '' } : row
            )));
            safeSet(setError)(err.message);
        } finally {
            creatingRef.current.delete(draftRow._id);
            safeSet(setSavingId)(null);
        }
    }, [safeSet, teamId]);

    const updateRow = useCallback(async (row, updates) => {
        safeSet(setSavingId)(row._id);
        safeSet(setError)(null);
        safeSet(setRows)((current) => current.map((currentRow) => (
            currentRow._id === row._id ? { ...currentRow, ...updates } : currentRow
        )));

        try {
            const response = await fetch(`/api/permissions/${row._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response, 'Failed to update permission row'));
            }

            const savedRow = await response.json();
            safeSet(setRows)((current) => current.map((currentRow) => (
                currentRow._id === row._id ? savedRow : currentRow
            )));
        } catch (err) {
            safeSet(setRows)((current) => current.map((currentRow) => (
                currentRow._id === row._id ? row : currentRow
            )));
            safeSet(setError)(err.message);
        } finally {
            safeSet(setSavingId)(null);
        }
    }, [safeSet]);

    const changeDepartment = useCallback((row, department) => {
        const next = normalizeDepartment(department);
        if (next === normalizeDepartment(row.department)) return;

        if (isDraftRow(row)) {
            saveDraftRow(row, next);
            return;
        }

        const departmentMembers = toStoredMembers(filterMembersByDepartment(members, next));
        updateRow(row, { department: next, members: departmentMembers });
    }, [members, saveDraftRow, updateRow]);

    const toggleMember = useCallback((row, member, checked) => {
        if (isDraftRow(row)) return;
        const selected = new Map((row.members || []).map((entry) => [entry.id, entry]));
        if (checked) selected.set(member.id, toStoredMember(member));
        else selected.delete(member.id);
        updateRow(row, { members: sortByName([...selected.values()]) });
    }, [updateRow]);

    const toggleEnabled = useCallback((row, enabled) => {
        if (isDraftRow(row)) return;
        updateRow(row, { enabled });
    }, [updateRow]);

    const deleteRow = useCallback(async (id) => {
        safeSet(setSavingId)(id);
        safeSet(setError)(null);

        try {
            const response = await fetch(`/api/permissions/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error(await getErrorMessage(response, 'Failed to delete permission row'));
            }
            safeSet(setRows)((current) => current.filter((row) => row._id !== id));
        } catch (err) {
            safeSet(setError)(err.message);
        } finally {
            safeSet(setSavingId)(null);
        }
    }, [safeSet]);

    return {
        rows,
        members,
        loading,
        savingId,
        error,
        setError: safeSet(setError),
        addDraftRow,
        removeDraftRow,
        changeDepartment,
        toggleMember,
        toggleEnabled,
        deleteRow
    };
}
