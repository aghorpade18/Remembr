import { useRef, useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogBody, DialogContent,
    DialogSurface, DialogTitle, Field, Text, Textarea, makeStyles
} from '@fluentui/react-components';
import { ArrowUpload24Regular, DocumentText24Regular, Checkmark16Regular } from '@fluentui/react-icons';

const useDialogStyles = makeStyles({
    surface: {
        maxWidth: '480px',
        borderRadius: '12px',
        padding: '20px 24px'
    },
    title: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1a1a1a',
        paddingBottom: '12px'
    },
    tabContainer: {
        display: 'flex',
        gap: '6px',
        marginBottom: '16px',
        padding: '3px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
    },
    tab: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '10px 14px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        color: '#666',
        transition: 'all 0.2s ease'
    },
    tabActive: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '10px 14px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        color: '#0078d4',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease'
    },
    uploadArea: {
        border: '2px dashed #d0d0d0',
        borderRadius: '10px',
        padding: '24px 20px',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            borderColor: '#0078d4',
            backgroundColor: '#f0f7ff'
        }
    },
    uploadIcon: {
        width: '40px',
        height: '40px',
        margin: '0 auto 8px',
        color: '#0078d4'
    },
    uploadText: {
        color: '#444',
        fontSize: '14px',
        marginBottom: '2px'
    },
    uploadHint: {
        color: '#888',
        fontSize: '12px'
    },
    selectedFile: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 12px',
        backgroundColor: '#e8f4fd',
        borderRadius: '6px',
        marginTop: '10px',
        color: '#0078d4',
        fontWeight: '500',
        fontSize: '13px'
    },
    textarea: {
        width: '100%',
        minHeight: '140px',
        fontFamily: "'Consolas', 'Monaco', monospace",
        fontSize: '12px',
        lineHeight: '1.5',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        resize: 'vertical'
    },
    hint: {
        marginTop: '14px',
        padding: '10px 12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#555',
        lineHeight: '1.4'
    },
    error: {
        color: '#d32f2f',
        marginTop: '10px',
        fontSize: '12px',
        fontWeight: '500'
    },
    actions: {
        paddingTop: '16px',
        gap: '10px',
        justifyContent: 'flex-end'
    },
    cancelBtn: {
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '13px',
        minWidth: 'auto'
    },
    submitBtn: {
        borderRadius: '6px',
        padding: '8px 18px',
        fontSize: '13px',
        fontWeight: '600',
        minWidth: 'auto'
    }
});

export function UploadDialog({ open, onOpenChange, department, onUpload }) {
    const styles = useDialogStyles();
    const fileRef = useRef(null);
    const [file, setFile] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [inputMode, setInputMode] = useState('file');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const reset = () => {
        setFile(null);
        setTextContent('');
        setError(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const close = () => {
        reset();
        onOpenChange(false);
    };

    const submit = async () => {
        setUploading(true);
        setError(null);
        try {
            if (inputMode === 'file') {
                if (!file) return;
                await onUpload(file);
            } else {
                if (!textContent.trim()) return;
                const blob = new Blob([textContent], { type: 'text/markdown' });
                const textFile = new File([blob], 'skill.md', { type: 'text/markdown' });
                await onUpload(textFile);
            }
            reset();
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const canSubmit = inputMode === 'file' ? !!file : !!textContent.trim();

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && close()}>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle className={styles.title}>
                        Upload Skill for {department}
                    </DialogTitle>
                    <DialogContent>
                        <div className={styles.tabContainer}>
                            <button
                                className={inputMode === 'file' ? styles.tabActive : styles.tab}
                                onClick={() => setInputMode('file')}
                            >
                                <ArrowUpload24Regular />
                                Upload File
                            </button>
                            <button
                                className={inputMode === 'text' ? styles.tabActive : styles.tab}
                                onClick={() => setInputMode('text')}
                            >
                                <DocumentText24Regular />
                                Paste Text
                            </button>
                        </div>

                        {inputMode === 'file' ? (
                            <>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".json,.md,.txt"
                                    style={{ display: 'none' }}
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div
                                    className={styles.uploadArea}
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <ArrowUpload24Regular className={styles.uploadIcon} style={{ width: 48, height: 48 }} />
                                    <div className={styles.uploadText}>
                                        Click to select a file
                                    </div>
                                    <div className={styles.uploadHint}>
                                        Supports .json, .md, or .txt
                                    </div>
                                </div>
                                {file && (
                                    <div className={styles.selectedFile}>
                                        <Checkmark16Regular />
                                        {file.name}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Field label="Paste your skill content">
                                <Textarea
                                    value={textContent}
                                    onChange={(_, data) => setTextContent(data.value)}
                                    placeholder="# Skill Name&#10;&#10;Enter your skill instructions here...&#10;&#10;- Step 1&#10;- Step 2"
                                    className={styles.textarea}
                                    resize="vertical"
                                />
                            </Field>
                        )}

                        <div className={styles.hint}>
                            Skills are uploaded as <strong>Draft</strong>. Activate from the list to make it live.
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                    </DialogContent>
                    <DialogActions className={styles.actions}>
                        <Button
                            appearance="secondary"
                            className={styles.cancelBtn}
                            onClick={close}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            className={styles.submitBtn}
                            onClick={submit}
                            disabled={!canSubmit || uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
