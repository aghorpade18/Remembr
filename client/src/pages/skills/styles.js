import { makeStyles } from '@fluentui/react-components';

export const useSkillsStyles = makeStyles({
    panel: { border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' },
    toolbar: {
        display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '16px',
        alignItems: 'flex-start', justifyContent: 'space-between'
    },
    titleBlock: { display: 'flex', flexDirection: 'column', gap: '2px' },
    toolbarActions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
    error: { color: '#b10e1c', margin: '0 16px 12px' },
    emptyState: { textAlign: 'center', padding: '28px', color: '#666' },
    table: { borderTop: '1px solid #e6e6e6' },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(160px, .8fr) minmax(120px, .6fr) minmax(180px, .8fr)',
        backgroundColor: '#f5f5f5',
        '@media (max-width: 760px)': { display: 'none' }
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(160px, .8fr) minmax(120px, .6fr) minmax(180px, .8fr)',
        '@media (max-width: 760px)': { gridTemplateColumns: '1fr', gap: '12px', padding: '14px 16px' }
    },
    headerCell: { padding: '12px 16px', borderRight: '1px solid #e6e6e6', fontWeight: 600 },
    cell: {
        padding: '10px 16px',
        borderTop: '1px solid #e6e6e6',
        borderRight: '1px solid #e6e6e6',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '@media (max-width: 760px)': { padding: 0, borderTop: 0, borderRight: 0 }
    },
    cellLabel: { display: 'none', '@media (max-width: 760px)': { display: 'block', marginBottom: '4px' } },
    actions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    preview: { maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', margin: 0 },
    uploadRow: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }
});
