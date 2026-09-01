import { makeStyles } from '@fluentui/react-components';

export const useIntegrationsStyles = makeStyles({
    panel: { border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' },
    toolbar: {
        display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '16px',
        alignItems: 'flex-start', justifyContent: 'space-between'
    },
    titleBlock: { display: 'flex', flexDirection: 'column', gap: '2px' },
    toolbarActions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
    error: { color: '#b10e1c', margin: '0 16px 12px' },
    emptyState: { textAlign: 'center', padding: '28px', color: '#666' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
        padding: '16px',
        borderTop: '1px solid #e6e6e6'
    },
    card: { padding: '16px' },
    fields: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' },
    cardActions: { display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'flex-end' }
});
