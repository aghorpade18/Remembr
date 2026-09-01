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
        display: 'flex', flexWrap: 'wrap', gap: '18px', padding: '22px 24px',
        alignItems: 'flex-start', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #fafbfc 0%, #fff 100%)',
        '@media (max-width: 600px)': { padding: '18px 16px' }
    },
    pageTitle: { fontSize: '20px', fontWeight: 700, color: '#242424' },
    titleBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
    toolbarActions: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        paddingTop: '2px',
        '@media (max-width: 860px)': { width: '100%', justifyContent: 'stretch', gap: '10px' }
    },
    toolbarControl: {
        minWidth: '220px',
        '@media (max-width: 860px)': { flex: '1 1 220px' },
        '@media (max-width: 600px)': { flex: '1 1 100%', minWidth: '100%' }
    },
    searchInput: {
        width: '260px',
        minWidth: '220px',
        '@media (max-width: 860px)': { flex: '1 1 220px', width: 'auto' },
        '@media (max-width: 600px)': { flex: '1 1 100%', width: '100%' }
    },
    toolbarButton: {
        minWidth: '88px',
        paddingLeft: '14px',
        paddingRight: '14px',
        '@media (max-width: 600px)': { flex: '1 1 calc(50% - 6px)' }
    },
    error: { color: '#b10e1c', margin: '0 20px 16px', fontWeight: '500' },
    emptyState: { textAlign: 'center', padding: '48px 20px', color: '#666' },
    table: { borderTop: '1px solid #e6e6e6', backgroundColor: '#fff' },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 1.5fr) minmax(140px, .7fr) minmax(110px, .5fr) minmax(170px, .7fr)',
        backgroundColor: '#fbfbfb',
        '@media (max-width: 760px)': { display: 'none' }
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 1.5fr) minmax(140px, .7fr) minmax(110px, .5fr) minmax(170px, .7fr)',
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
    skillNameBlock: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
    actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    preview: { maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', margin: 0, backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' },
    uploadRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
    dialogTitle: { fontSize: '20px', fontWeight: 700, color: '#242424' },
    dialogActions: { gap: '8px', paddingTop: '12px' },
    largeDialogSurface: {
        width: 'min(940px, calc(100vw - 32px))',
        maxWidth: '940px',
        borderRadius: '10px',
        padding: '10px',
        '@media (max-width: 600px)': { width: 'calc(100vw - 20px)' }
    },
    createDialogContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '10px 0 0'
    },
    createEditor: {
        width: '100%',
        minHeight: '320px',
        fontFamily: "'Consolas', 'Courier New', monospace",
        fontSize: '13px',
        lineHeight: 1.6,
        '@media (max-width: 600px)': { minHeight: '220px' }
    },
    draftBadge: {
        alignSelf: 'flex-start',
        padding: '4px 10px',
        borderRadius: '6px',
        backgroundColor: '#f3f2f1',
        color: '#605e5c',
        fontSize: '12px',
        fontWeight: 600
    },
    directorySurface: {
        width: 'min(860px, calc(100vw - 32px))',
        maxWidth: '860px',
        borderRadius: '10px',
        padding: '10px',
        '@media (max-width: 600px)': { width: 'calc(100vw - 20px)' }
    },
    directoryHeader: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '14px',
        paddingTop: '10px'
    },
    directorySearch: { width: '100%' },
    directoryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '12px',
        maxHeight: '520px',
        overflowY: 'auto',
        padding: '0 4px 10px 0',
        '@media (max-width: 720px)': { gridTemplateColumns: '1fr' }
    },
    directoryCard: {
        border: '1px solid #e5e5e5',
        borderRadius: '10px',
        backgroundColor: '#fff',
        padding: '14px',
        textAlign: 'left',
        cursor: 'pointer',
        minHeight: '126px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        ':hover': {
            borderColor: '#c7e0f4',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            transform: 'translateY(-1px)'
        }
    },
    directoryCardTop: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
    },
    directoryMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#707070',
        fontSize: '12px'
    },
    directorySummary: {
        color: '#616161',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical'
    }
});
