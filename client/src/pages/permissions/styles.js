import { makeStyles } from '@fluentui/react-components';

export const usePermissionsStyles = makeStyles({
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
        display: 'flex', gap: '16px', padding: '20px',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
        background: 'linear-gradient(180deg, #fafbfc 0%, #fff 100%)'
    },
    titleBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
    filters: {
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 240px)',
        gap: '16px',
        padding: '0 20px 20px',
        '@media (max-width: 760px)': { gridTemplateColumns: '1fr' }
    },
    filterControl: { width: '100%' },
    error: { color: '#b10e1c', margin: '0 20px 16px', fontWeight: '500' },
    table: { borderTop: '1px solid #e6e6e6' },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 1fr) minmax(240px, 1.2fr) minmax(160px, .8fr) minmax(96px, .4fr)',
        backgroundColor: '#f8f9fa',
        '@media (max-width: 760px)': { display: 'none' }
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 1fr) minmax(240px, 1.2fr) minmax(160px, .8fr) minmax(96px, .4fr)',
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
        '@media (max-width: 760px)': { padding: 0, borderTop: 0, borderRight: 0 }
    },
    cellLabel: { display: 'none', '@media (max-width: 760px)': { display: 'block', marginBottom: '4px', fontWeight: 500 } },
    departmentDropdown: { minWidth: '220px', width: '100%' },
    membersButton: { minWidth: '260px', width: '100%', justifyContent: 'space-between' },
    memberList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto', minWidth: '280px' },
    actions: { display: 'flex', gap: '8px', alignItems: 'center' },
    emptyState: { textAlign: 'center', padding: '48px 20px', color: '#666' },
    status: { display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }
});
