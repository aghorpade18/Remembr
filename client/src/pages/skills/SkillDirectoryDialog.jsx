import { useDeferredValue, useMemo, useState } from 'react';
import {
    Badge, Button, Dialog, DialogBody, DialogContent, DialogSurface,
    DialogTitle, Input, Text
} from '@fluentui/react-components';
import { CheckmarkCircle24Regular, Search24Regular } from '@fluentui/react-icons';
import { useSkillsStyles } from './styles';

const STATUS_COLOR = { active: 'success', inactive: 'informative', draft: 'warning' };
const STATUS_LABELS = { active: 'Active', inactive: 'Inactive', draft: 'Pending approval' };

function statusLabel(status = '') {
    return STATUS_LABELS[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown');
}

function contentSummary(skill) {
    if (typeof skill.content === 'string') return skill.content.replace(/\s+/g, ' ').trim();
    if (skill.content?.description) return skill.content.description;
    return 'No description available.';
}

export function SkillDirectoryDialog({ open, onOpenChange, skills, onSelect }) {
    const styles = useSkillsStyles();
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);

    const filteredSkills = useMemo(() => {
        const search = deferredQuery.trim().toLowerCase();
        const sortedSkills = [...skills].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        if (!search) return sortedSkills;
        return sortedSkills.filter((skill) => {
            const summary = contentSummary(skill);
            return [skill.originalName, skill.status, skill.contentType, summary]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(search));
        });
    }, [deferredQuery, skills]);

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onOpenChange(false)}>
            <DialogSurface className={styles.directorySurface}>
                <DialogBody>
                    <DialogTitle className={styles.dialogTitle}>Directory</DialogTitle>
                    <DialogContent>
                        <div className={styles.directoryHeader}>
                            <Input
                                className={styles.directorySearch}
                                contentBefore={<Search24Regular />}
                                placeholder="Search skills..."
                                value={query}
                                onChange={(_, data) => setQuery(data.value)}
                            />
                        </div>
                        <div className={styles.directoryGrid}>
                            {filteredSkills.length === 0 ? (
                                <div className={styles.emptyState}>No matching skills found.</div>
                            ) : filteredSkills.map((skill) => (
                                <button
                                    key={skill._id}
                                    className={styles.directoryCard}
                                    onClick={() => onSelect(skill)}
                                >
                                    <div className={styles.directoryCardTop}>
                                        <Text weight="semibold">/{skill.originalName?.replace(/\.[^/.]+$/, '') || skill.fileName}</Text>
                                        {skill.status === 'active' ? <CheckmarkCircle24Regular /> : <span>+</span>}
                                    </div>
                                    <div className={styles.directoryMeta}>
                                        <Badge appearance="tint" color={STATUS_COLOR[skill.status] || 'informative'}>
                                            {statusLabel(skill.status)}
                                        </Badge>
                                    </div>
                                    <Text className={styles.directorySummary} size={200}>
                                        {contentSummary(skill)}
                                    </Text>
                                </button>
                            ))}
                        </div>
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}