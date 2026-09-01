import { useRef, useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogBody, DialogContent,
    DialogSurface, DialogTitle, Field, Text
} from '@fluentui/react-components';
import { ArrowUpload24Regular } from '@fluentui/react-icons';
import { useSkillsStyles } from './styles';

export function UploadDialog({ open, onOpenChange, department, onUpload }) {
    const styles = useSkillsStyles();
    const fileRef = useRef(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const reset = () => {
        setFile(null);
        setError(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const close = () => {
        reset();
        onOpenChange(false);
    };

    const submit = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            await onUpload(file);
            reset();
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && close()}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Upload skill for {department}</DialogTitle>
                    <DialogContent>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <Field label="Select JSON file">
                            <div className={styles.uploadRow}>
                                <Button icon={<ArrowUpload24Regular />} onClick={() => fileRef.current?.click()}>
                                    Choose file
                                </Button>
                                <Text>{file?.name || 'No file selected'}</Text>
                            </div>
                        </Field>
                        <Text size={200}>
                            New skills are uploaded as Draft. Activate one from the list to make it live. Only one active
                            skill is allowed per department.
                        </Text>
                        {error && <Text style={{ color: '#b10e1c', marginTop: '8px' }}>{error}</Text>}
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={close} disabled={uploading}>Cancel</Button>
                        <Button appearance="primary" onClick={submit} disabled={!file || uploading}>
                            {uploading ? 'Uploading…' : 'Upload'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
