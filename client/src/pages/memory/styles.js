import { makeStyles } from '@fluentui/react-components';

export const useMemoryStyles = makeStyles({
    panel: {
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column'
    },
    toolbar: {
        display: 'flex', flexWrap: 'wrap', gap: '18px', padding: '22px 24px',
        alignItems: 'flex-start', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #fafbfc 0%, #fff 100%)',
        '@media (max-width: 600px)': { padding: '18px 16px' }
    },
    pageTitle: { fontSize: '20px', fontWeight: 700, color: '#242424' },
    titleBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
    toolbarControl: {
        minWidth: '220px',
        '@media (max-width: 600px)': { flex: '1 1 100%', minWidth: '100%' }
    },
    error: { color: '#b10e1c', margin: '0 20px 16px', fontWeight: '500' },
    emptyState: { textAlign: 'center', padding: '48px 20px', color: '#666' },
    spinnerContainer: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '60px 20px 80px', minHeight: '200px'
    },
    list: { borderTop: '1px solid #e6e6e6', minHeight: '160px' },
    group: { borderBottom: '1px solid #eef0f2', paddingBottom: '6px' },
    groupLabel: {
        display: 'block',
        padding: '18px 24px 6px',
        fontWeight: 700,
        fontSize: '15px',
        color: '#242424'
    },
    groupItems: {},
    row: {
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '10px 24px',
        ':hover': { backgroundColor: '#f8f9fa' },
        '@media (max-width: 600px)': { flexWrap: 'wrap', gap: '4px' }
    },
    rowTopic: {
        flex: '0 0 200px', minWidth: 0, fontWeight: 600, color: '#242424',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        '@media (max-width: 600px)': { flex: '1 1 100%' }
    },
    rowContent: {
        flex: 1, minWidth: 0, color: '#616161',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    },
    rowMeta: { flex: '0 0 auto', color: '#8a8886', fontSize: '12px', whiteSpace: 'nowrap' },
    rowActions: { flex: '0 0 auto', display: 'flex', gap: '6px', alignItems: 'center' },
    composerBar: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 24px', borderTop: '1px solid #e6e6e6', backgroundColor: '#fafbfc'
    },
    composerInput: {
        flex: 1,
        borderRadius: '24px',
        backgroundColor: '#fff'
    },
    sendButton: { borderRadius: '50%', minWidth: '40px', width: '40px', height: '40px', padding: 0 }
});
