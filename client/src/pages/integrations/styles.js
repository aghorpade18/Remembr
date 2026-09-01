import { makeStyles } from '@fluentui/react-components';

export const useIntegrationsStyles = makeStyles({
    panel: {
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        backgroundColor: '#fff',
        overflow: 'hidden',
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
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        alignItems: 'start',
        gap: '20px',
        padding: '20px',
        borderTop: '1px solid #e6e6e6'
    },
    card: {
        padding: '20px',
        borderRadius: '10px',
        alignSelf: 'start',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        ':hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' }
    },
    logoFrame: {
        width: '32px',
        height: '32px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        backgroundColor: '#f5f7fa',
        border: '1px solid #e5e7eb'
    },
    logoImage: {
        width: '22px',
        height: '22px',
        objectFit: 'contain',
        display: 'block'
    },
    headerActions: { display: 'flex', alignItems: 'center', gap: '8px' },
    dialogHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
    },
    fields: { display: 'flex', flexDirection: 'column', gap: '10px' },
    cardActions: { display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end' }
});
