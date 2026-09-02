import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Spinner, Text } from '@fluentui/react-components';
import { Delete16Regular, Send24Filled } from '@fluentui/react-icons';
import { DepartmentPicker } from '../components/DepartmentPicker';
import { useTeamDepartments } from '../hooks/useTeamDepartments';
import { useMemory } from './memory/useMemory';
import { useMemoryStyles } from './memory/styles';

// Top-level section order shown in the UI, matching the memory model.
const SECTION_ORDER = ['You', 'Teams', 'Areas'];

function timeAgo(date) {
    const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function Memory({ teamId }) {
    const styles = useMemoryStyles();
    const { departments, loading: departmentsLoading, error: departmentsError } = useTeamDepartments(teamId);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [draft, setDraft] = useState('');

    useEffect(() => {
        if (!selectedDepartment && departments.length > 0) setSelectedDepartment(departments[0]);
    }, [departments, selectedDepartment]);

    const { memories, loading, generating, error, generate, toggle, deleteMemory } = useMemory(teamId, selectedDepartment);

    const showSpinner = departmentsLoading || (loading && selectedDepartment);

    const groups = useMemo(() => {
        const bySection = new Map();
        for (const memory of memories) {
            const section = SECTION_ORDER.includes(memory.section) ? memory.section : 'Teams';
            if (!bySection.has(section)) bySection.set(section, []);
            bySection.get(section).push(memory);
        }
        return SECTION_ORDER
            .filter((section) => bySection.has(section))
            .map((section) => ({
                section,
                items: bySection.get(section).sort((a, b) => (a.topic || '').localeCompare(b.topic || ''))
            }));
    }, [memories]);

    const handleSend = async () => {
        const text = draft.trim();
        if (!text) return;
        setDraft('');
        try {
            await generate(text);
        } catch {
            // error already surfaced via hook state
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.toolbar}>
                <div className={styles.titleBlock}>
                    <Text className={styles.pageTitle}>Memory</Text>
                    <Text size={200}>The agent remembers useful details from chats for this department.</Text>
                </div>
                <div className={styles.toolbarControl}>
                    <DepartmentPicker departments={departments} value={selectedDepartment} onChange={setSelectedDepartment} />
                </div>
            </div>

            {(departmentsError || error) && <Text className={styles.error}>{departmentsError || error}</Text>}

            {showSpinner ? (
                <div className={styles.spinnerContainer}>
                    <Spinner label="Loading memory..." />
                </div>
            ) : !selectedDepartment ? (
                <div className={styles.emptyState}>
                    {departments.length === 0 ? 'No departments found for this team.' : 'Select a department to see memory.'}
                </div>
            ) : (
                <div className={styles.list}>
                    {groups.length === 0 && (
                        <div className={styles.emptyState}>No memories yet. Type something below to remember it.</div>
                    )}
                    {groups.map(({ section, items }) => (
                        <div className={styles.group} key={section}>
                            <Text className={styles.groupLabel}>{section}</Text>
                            <div className={styles.groupItems}>
                                {items.map((memory) => (
                                    <div className={styles.row} key={memory._id}>
                                        <Text className={styles.rowTopic}>{memory.topic || 'General'}</Text>
                                        <Text className={styles.rowContent}>{memory.content}</Text>
                                        <Text className={styles.rowMeta}>Updated {timeAgo(memory.updatedAt)}</Text>
                                        <div className={styles.rowActions}>
                                            <Button size="small" appearance="subtle" onClick={() => toggle(memory)}>
                                                {memory.enabled ? 'Enabled' : 'Disabled'}
                                            </Button>
                                            <Button size="small" appearance="subtle" icon={<Delete16Regular />} onClick={() => deleteMemory(memory._id)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.composerBar}>
                <Input
                    className={styles.composerInput}
                    placeholder="Don't let me forget..."
                    value={draft}
                    disabled={!selectedDepartment || generating}
                    onChange={(_, data) => setDraft(data.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                />
                <Button
                    className={styles.sendButton}
                    appearance="primary"
                    shape="circular"
                    icon={generating ? <Spinner size="tiny" /> : <Send24Filled />}
                    disabled={!draft.trim() || !selectedDepartment || generating}
                    onClick={handleSend}
                />
            </div>
        </div>
    );
}
