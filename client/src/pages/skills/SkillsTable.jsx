import { memo, useState } from 'react';
import {
    Badge, Button, Dialog, DialogActions, DialogBody, DialogContent,
    DialogSurface, DialogTitle, DialogTrigger, Text, Tooltip
} from '@fluentui/react-components';
import {
    Delete24Regular, Eye24Regular, PlayCircle24Regular,
    PauseCircle24Regular, DocumentEdit24Regular
} from '@fluentui/react-icons';
import { useSkillsStyles } from './styles';

const STATUS_COLOR = { active: 'success', inactive: 'informative', draft: 'warning' };

function SkillRowBase({ skill, onActivate, onDeactivate, onSetDraft, onView, onDelete }) {
    const styles = useSkillsStyles();
    return (
        <div className={styles.tableRow} role="row">
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">File name</Text>
                <div className={styles.skillNameBlock}>
                    <Text weight="semibold">{skill.originalName}</Text>
                    <Text size={200}>{skill.contentType || 'json'}</Text>
                </div>
            </div>
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Uploaded</Text>
                <Text>{new Date(skill.createdAt).toLocaleString()}</Text>
            </div>
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Status</Text>
                <Badge appearance="filled" color={STATUS_COLOR[skill.status] || 'informative'}>
                    {skill.status.charAt(0).toUpperCase() + skill.status.slice(1)}
                </Badge>
            </div>
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Actions</Text>
                <div className={styles.actions}>
                    <Tooltip content="View content" relationship="label" withArrow>
                        <Button size="small" icon={<Eye24Regular />} onClick={onView} aria-label="View content" />
                    </Tooltip>
                    {skill.status !== 'active' && (
                        <Tooltip content="Activate skill" relationship="label" withArrow>
                            <Button
                                size="small"
                                icon={<PlayCircle24Regular />}
                                onClick={onActivate}
                                aria-label="Activate skill"
                            />
                        </Tooltip>
                    )}
                    {skill.status === 'active' && (
                        <Tooltip content="Deactivate skill" relationship="label" withArrow>
                            <Button
                                size="small"
                                icon={<PauseCircle24Regular />}
                                onClick={onDeactivate}
                                aria-label="Deactivate skill"
                            />
                        </Tooltip>
                    )}
                    {skill.status !== 'draft' && (
                        <Tooltip content="Move back to draft" relationship="label" withArrow>
                            <Button
                                size="small"
                                icon={<DocumentEdit24Regular />}
                                onClick={onSetDraft}
                                aria-label="Move back to draft"
                            />
                        </Tooltip>
                    )}
                    <Tooltip content="Delete skill" relationship="label" withArrow>
                        <Button size="small" icon={<Delete24Regular />} onClick={onDelete} aria-label="Delete skill" />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

const SkillRow = memo(SkillRowBase);

export function SkillsTable({ skills, emptyMessage, onActivate, onDeactivate, onSetDraft, onDelete }) {
    const styles = useSkillsStyles();
    const [preview, setPreview] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);

    const confirmDelete = () => {
        if (pendingDelete) onDelete(pendingDelete._id);
        setPendingDelete(null);
    };

    if (skills.length === 0) {
        return <div className={styles.emptyState}>{emptyMessage}</div>;
    }

    return (
        <>
            <div className={styles.table} role="table" aria-label="Skills">
                <div className={styles.tableHeader} role="row">
                    <div className={styles.headerCell} role="columnheader">File name</div>
                    <div className={styles.headerCell} role="columnheader">Uploaded</div>
                    <div className={styles.headerCell} role="columnheader">Status</div>
                    <div className={styles.headerCell} role="columnheader">Actions</div>
                </div>
                <div role="rowgroup">
                    {skills.map((skill) => (
                        <SkillRow
                            key={skill._id}
                            skill={skill}
                            onView={() => setPreview(skill)}
                            onActivate={() => onActivate(skill)}
                            onDeactivate={() => onDeactivate(skill)}
                            onSetDraft={() => onSetDraft(skill)}
                            onDelete={() => setPendingDelete(skill)}
                        />
                    ))}
                </div>
            </div>

            <Dialog open={Boolean(preview)} onOpenChange={(_, data) => !data.open && setPreview(null)}>
                <DialogSurface style={{ maxWidth: '700px' }}>
                    <DialogBody>
                        <DialogTitle>{preview?.originalName}</DialogTitle>
                        <DialogContent>
                            <pre className={styles.preview}>
                                {preview ? (
                                    preview.contentType === 'json' || typeof preview.content === 'object'
                                        ? JSON.stringify(preview.content, null, 2)
                                        : preview.content
                                ) : ''}
                            </pre>
                        </DialogContent>
                        <DialogActions>
                            <DialogTrigger disableButtonEnhancement>
                                <Button>Close</Button>
                            </DialogTrigger>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Dialog
                open={Boolean(pendingDelete)}
                onOpenChange={(_, data) => !data.open && setPendingDelete(null)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Delete skill?</DialogTitle>
                        <DialogContent>
                            This will remove "{pendingDelete?.originalName}" from the {pendingDelete?.department} department.
                        </DialogContent>
                        <DialogActions>
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="secondary">Cancel</Button>
                            </DialogTrigger>
                            <Button appearance="primary" icon={<Delete24Regular />} onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    );
}
