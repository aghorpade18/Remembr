import { useCallback, useEffect, useRef, useState } from 'react';
import { getGraphToken } from '../../authConfig';

const DEFAULT_TARGETS = {
    channel: [
        { id: 'manual-channel-team-akshara', displayName: 'Team Akshara' }
    ],
    groupchat: [
        { id: 'manual-group-frontend-pull-request-reviews', displayName: 'Frontend Pull Request Reviews' },
        { id: 'manual-group-dbcu-b2b-edx-rnd', displayName: 'team-dbcu-b2b-edx-rnd' },
        { id: 'manual-group-self-partner-onboarding-phase-2', displayName: 'Self Partner Onboarding Phase 2 Grooming' },
        { id: 'manual-group-edx-scrum-standup', displayName: 'EDX Scrum Standup' },
        { id: 'manual-group-retrospective-edx-eurex-c', displayName: 'Retrospective - EDX + Eurex-C' },
        { id: 'manual-group-edx-dev-ux-sync-up', displayName: 'EDX Dev-UX sync up' }
    ]
};

async function getErrorMessage(response, fallbackMessage) {
    try {
        const data = await response.clone().json();
        if (data.error) return data.error;
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            return data.errors
                .map(error => error.msg || error.message)
                .filter(Boolean)
                .join(', ') || fallbackMessage;
        }
    } catch { }

    return fallbackMessage;
}

async function fetchJson(url, options, fallbackMessage) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(await getErrorMessage(response, fallbackMessage));
    return response.json();
}

function rowKey(row) {
    return row._id || `${row.targetType}-${row.targetId}`;
}

function toTargetOptions(channels, groupChats) {
    return {
        channel: mergeTargets(
            channels.map(channel => ({ id: channel.id, displayName: channel.displayName })),
            DEFAULT_TARGETS.channel
        ),
        groupchat: mergeTargets(
            groupChats.map(chat => ({ id: chat.id, displayName: chat.displayName })),
            DEFAULT_TARGETS.groupchat
        )
    };
}

function mergeTargets(primaryTargets, fallbackTargets) {
    const seen = new Set();
    const merged = [];

    for (const target of [...primaryTargets, ...fallbackTargets]) {
        const name = target.displayName?.trim();
        if (!target.id || !name) continue;

        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push({ id: target.id, displayName: name });
    }

    return merged.sort((first, second) => first.displayName.localeCompare(second.displayName));
}

function findTarget(targets, targetType, targetId) {
    return (targets[targetType] || []).find(target => target.id === targetId);
}

function createDraftRow(targets) {
    const firstChannel = targets.channel[0];

    return {
        _id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        targetType: 'channel',
        targetId: firstChannel?.id || '',
        targetName: firstChannel?.displayName || '',
        token: 0,
        enabled: true,
        dirty: true,
        isEditing: true,
        isDraft: true
    };
}

function toRows(tokens, targets) {
    return tokens.map(token => {
        const target = findTarget(targets, token.targetType, token.targetId);
        return {
            targetType: token.targetType,
            targetId: token.targetId,
            targetName: target?.displayName || token.targetName,
            token: token.token ?? 0,
            enabled: token.enabled !== false,
            dirty: false,
            isEditing: false
        };
    });
}

export function useTeamTokens(teamId) {
    const [rows, setRows] = useState([]);
    const [targets, setTargets] = useState({ channel: [], groupchat: [] });
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState(null);
    const activeRef = useRef(true);

    useEffect(() => {
        activeRef.current = true;
        return () => { activeRef.current = false; };
    }, []);

    const safeSet = useCallback((setter) => (value) => {
        if (activeRef.current) setter(value);
    }, []);

    const load = useCallback(async () => {
        if (!teamId) {
            safeSet(setRows)([]);
            safeSet(setTargets)({ channel: [], groupchat: [] });
            safeSet(setLoading)(false);
            return;
        }

        safeSet(setLoading)(true);
        safeSet(setError)(null);

        try {
            const token = await getGraphToken();
            const headers = { Authorization: `Bearer ${token}` };
            const [tokens, channels, groupChats] = await Promise.all([
                fetchJson(`/api/team-tokens/${encodeURIComponent(teamId)}`, undefined, 'Failed to load saved tokens'),
                fetchJson(`/api/graph/teams/${encodeURIComponent(teamId)}/channels`, { headers }, 'Failed to load channels'),
                fetchJson('/api/graph/me/groupChats', { headers }, 'Failed to load group chats')
            ]);
            const targetOptions = toTargetOptions(channels.value || [], groupChats.value || []);

            safeSet(setTargets)(targetOptions);
            safeSet(setRows)(toRows(tokens, targetOptions));
        } catch (err) {
            safeSet(setRows)([]);
            safeSet(setTargets)({ channel: [], groupchat: [] });
            safeSet(setError)(err.message);
        } finally {
            safeSet(setLoading)(false);
        }
    }, [teamId, safeSet]);

    useEffect(() => { load(); }, [load]);

    const addRow = useCallback(() => {
        safeSet(setError)(null);
        safeSet(setRows)((current) => [...current, createDraftRow(targets)]);
    }, [safeSet, targets]);

    const removeRow = useCallback((row) => {
        safeSet(setRows)((current) => current.filter((entry) => rowKey(entry) !== rowKey(row)));
    }, [safeSet]);

    const editRow = useCallback((row) => {
        safeSet(setRows)((current) => current.map((entry) => (
            rowKey(entry) === rowKey(row) ? { ...entry, isEditing: true } : entry
        )));
    }, [safeSet]);

    const updateTargetType = useCallback((row, targetType) => {
        const target = (targets[targetType] || [])[0];
        safeSet(setRows)((current) => current.map((entry) => (
            rowKey(entry) === rowKey(row)
                ? {
                    ...entry,
                    targetType,
                    targetId: target?.id || '',
                    targetName: target?.displayName || '',
                    isEditing: true,
                    dirty: true
                }
                : entry
        )));
    }, [safeSet, targets]);

    const updateTarget = useCallback((row, targetId) => {
        const target = findTarget(targets, row.targetType, targetId);
        safeSet(setRows)((current) => current.map((entry) => (
            rowKey(entry) === rowKey(row)
                ? { ...entry, targetId, targetName: target?.displayName || '', isEditing: true, dirty: true }
                : entry
        )));
    }, [safeSet, targets]);

    const updateToken = useCallback((row, token) => {
        safeSet(setRows)((current) => current.map((entry) => (
            rowKey(entry) === rowKey(row) ? { ...entry, token, isEditing: true, dirty: true } : entry
        )));
    }, [safeSet]);

    const updateEnabled = useCallback((row, enabled) => {
        safeSet(setRows)((current) => current.map((entry) => (
            rowKey(entry) === rowKey(row) ? { ...entry, enabled, isEditing: true, dirty: true } : entry
        )));
    }, [safeSet]);

    const saveToken = useCallback(async (row) => {
        const id = rowKey(row);
        safeSet(setSavingId)(id);
        safeSet(setError)(null);

        try {
            const saved = await fetchJson('/api/team-tokens', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    targetType: row.targetType,
                    targetId: row.targetId,
                    targetName: row.targetName,
                    token: Number(row.token || 0),
                    enabled: row.enabled !== false
                })
            }, 'Failed to save token');

            safeSet(setRows)((current) => current.map((entry) => (
                rowKey(entry) === id ? {
                    targetType: saved.targetType,
                    targetId: saved.targetId,
                    targetName: saved.targetName,
                    token: saved.token ?? 0,
                    enabled: saved.enabled !== false,
                    dirty: false,
                    isEditing: false
                } : entry
            )));
        } catch (err) {
            safeSet(setError)(err.message);
        } finally {
            safeSet(setSavingId)(null);
        }
    }, [safeSet, teamId]);

    return {
        rows,
        targets,
        loading,
        savingId,
        error,
        addRow,
        removeRow,
        editRow,
        updateTargetType,
        updateTarget,
        updateToken,
        updateEnabled,
        saveToken,
        refresh: load
    };
}