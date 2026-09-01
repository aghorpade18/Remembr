import { makeStyles } from '@fluentui/react-components';

export const usePermissionsStyles = makeStyles({
    panel: { border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' },
    toolbar: { display: 'flex', gap: '12px', padding: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
    titleBlock: { display: 'flex', flexDirection: 'column', gap: '2px' },
    filters: {
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 240px)',
        gap: '12px',
        padding: '0 16px 16px',
        '@media (max-width: 760px)': { gridTemplateColumns: '1fr' }
    },
    filterControl: { width: '100%' },
    error: { color: '#b10e1c', margin: '0 16px 12px' },
    table: { borderTop: '1px solid #e6e6e6' },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 1fr) minmax(240px, 1.2fr) minmax(160px, .8fr) minmax(96px, .4fr)',
        backgroundColor: '#f5f5f5',
        '@media (max-width: 760px)': { display: 'none' }
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 1fr) minmax(240px, 1.2fr) minmax(160px, .8fr) minmax(96px, .4fr)',
        '@media (max-width: 760px)': { gridTemplateColumns: '1fr', gap: '12px', padding: '14px 16px' }
    },
    headerCell: { padding: '12px 16px', borderRight: '1px solid #e6e6e6', fontWeight: 600 },
    cell: {
        padding: '10px 16px',
        borderTop: '1px solid #e6e6e6',
        borderRight: '1px solid #e6e6e6',
        minWidth: 0,
        '@media (max-width: 760px)': { padding: 0, borderTop: 0, borderRight: 0 }
    },
    cellLabel: { display: 'none', '@media (max-width: 760px)': { display: 'block', marginBottom: '4px' } },
    departmentDropdown: { minWidth: '220px', width: '100%' },
    membersButton: { minWidth: '260px', width: '100%', justifyContent: 'space-between' },
    memberList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto', minWidth: '280px' },
    actions: { display: 'flex', gap: '8px', alignItems: 'center' },
    emptyState: { textAlign: 'center', padding: '28px', color: '#666' },
    status: { display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }
});
