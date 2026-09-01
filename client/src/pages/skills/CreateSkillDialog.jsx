import { useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogBody, DialogContent,
    DialogSurface, DialogTitle, Field, Input, Text, Textarea
} from '@fluentui/react-components';
import { useSkillsStyles } from './styles';

function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'skill';
}

function buildSkillMarkdown({ name, description, content }) {
    return `---\nname: ${name.trim()}\ndescription: ${description.trim()}\n---\n\n${content.trim()}\n`;
}

export function CreateSkillDialog({ open, onOpenChange, department, onCreate }) {
    const styles = useSkillsStyles();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const close = () => {
        setName('');
        setDescription('');
        setContent('');
        setError('');
        onOpenChange(false);
    };

    const submit = async () => {
        if (!name.trim() || !description.trim() || !content.trim()) return;
        setSaving(true);
        setError('');
        try {
            const body = buildSkillMarkdown({ name, description, content });
            const file = new File([body], `${slugify(name)}.md`, { type: 'text/markdown' });
            await onCreate(file);
            close();
        } catch (err) {
            setError(err.message || 'Unable to create skill');
        } finally {
            setSaving(false);
        }
    };

    const canSubmit = name.trim() && description.trim() && content.trim() && !saving;

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && close()}>
            <DialogSurface className={styles.largeDialogSurface}>
                <DialogBody>
                    <DialogTitle className={styles.dialogTitle}>Create a skill</DialogTitle>
                    <DialogContent className={styles.createDialogContent}>
                        <Field label="Skill name" required>
                            <Input
                                value={name}
                                onChange={(_, data) => setName(data.value)}
                                placeholder="weekly-status-report"
                            />
                        </Field>
                        <Field label="Description" required>
                            <Textarea
                                value={description}
                                onChange={(_, data) => setDescription(data.value)}
                                placeholder="Generate weekly status reports from recent work."
                                resize="vertical"
                                rows={3}
                            />
                        </Field>
                        <Field label="Instructions" required>
                            <Textarea
                                className={styles.createEditor}
                                value={content}
                                onChange={(_, data) => setContent(data.value)}
                                placeholder="Summarize my recent work in three sections: wins, blockers, and next steps."
                                resize="vertical"
                            />
                        </Field>
                        <div className={styles.draftBadge}>Draft</div>
                        {error && <Text className={styles.error}>{error}</Text>}
                    </DialogContent>
                    <DialogActions className={styles.dialogActions}>
                        <Button size="small" appearance="secondary" onClick={close} disabled={saving}>Cancel</Button>
                        <Button size="small" appearance="primary" onClick={submit} disabled={!canSubmit}>
                            {saving ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}