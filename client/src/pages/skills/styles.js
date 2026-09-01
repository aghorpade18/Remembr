import { makeStyles } from '@fluentui/react-components';

export const useSkillsStyles = makeStyles({
    panel: {
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 20px 80px',
        minHeight: '200px'
    },
    toolbar: {
        display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '20px',
        alignItems: 'flex-start', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #fafbfc 0%, #fff 100%)'
    },
    titleBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
    toolbarActions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
    error: { color: '#b10e1c', margin: '0 20px 16px', fontWeight: '500' },
    emptyState: { textAlign: 'center', padding: '48px 20px', color: '#666' },
    table: { borderTop: '1px solid #e6e6e6' },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(160px, .8fr) minmax(120px, .6fr) minmax(180px, .8fr)',
        backgroundColor: '#f8f9fa',
        '@media (max-width: 760px)': { display: 'none' }
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(160px, .8fr) minmax(120px, .6fr) minmax(180px, .8fr)',
        transition: 'background-color 0.15s ease',
        ':hover': { backgroundColor: '#f8f9fa' },
        '@media (max-width: 760px)': { gridTemplateColumns: '1fr', gap: '12px', padding: '16px 20px' }
    },
    headerCell: { padding: '14px 20px', borderRight: '1px solid #e6e6e6', fontWeight: 600, color: '#424242' },
    cell: {
        padding: '12px 20px',
        borderTop: '1px solid #e6e6e6',
        borderRight: '1px solid #e6e6e6',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '@media (max-width: 760px)': { padding: 0, borderTop: 0, borderRight: 0 }
    },
    cellLabel: { display: 'none', '@media (max-width: 760px)': { display: 'block', marginBottom: '4px', fontWeight: 500 } },
    actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    preview: { maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', margin: 0, backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' },
    uploadRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }
});
