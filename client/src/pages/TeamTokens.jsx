import { Button, Spinner, Text } from '@fluentui/react-components';
import { Add24Regular } from '@fluentui/react-icons';
import { TeamTokenRow } from './teamTokens/TeamTokenRow';
import { useTeamTokens } from './teamTokens/useTeamTokens';
import { useTeamTokensStyles } from './teamTokens/styles';

export default function TeamTokens({ teamId }) {
    const styles = useTeamTokensStyles();
    const {
        rows, targets, loading, savingId, error,
        addRow, removeRow, editRow, updateTargetType, updateTarget, updateToken, updateEnabled, saveToken
    } = useTeamTokens(teamId);

    if (loading) return (
        <div className={styles.panel}>
            <div className={styles.spinnerContainer}>
                <Spinner label="Loading channels and group chats..." />
            </div>
        </div>
    );

    return (
        <div className={styles.panel}>
            <div className={styles.toolbar}>
                <div className={styles.titleBlock}>
                    <Text weight="semibold">Configuration</Text>
                    <Text size={200}>Enable or disable token usage for Teams groups or channels.</Text>
                </div>
                <Button appearance="primary" icon={<Add24Regular />} onClick={addRow}>
                    Add row
                </Button>
            </div>

            {error && <Text className={styles.error}>{error}</Text>}

            <div className={styles.table} role="table" aria-label="Configuration">
                <div className={styles.tableHeader} role="row">
                    <div className={styles.headerCell} role="columnheader">Type</div>
                    <div className={styles.headerCell} role="columnheader">Group name</div>
                    <div className={styles.headerCell} role="columnheader">Token usage</div>
                    <div className={styles.headerCell} role="columnheader">Status</div>
                    <div className={styles.headerCell} role="columnheader">Actions</div>
                </div>
                <div role="rowgroup">
                    {rows.length === 0 ? (
                        <div className={styles.emptyState}>No channels or group chats are available.</div>
                    ) : rows.map((row) => (
                        <TeamTokenRow
                            key={row._id || `${row.targetType}-${row.targetId}`}
                            row={row}
                            targets={targets}
                            saving={savingId === (row._id || `${row.targetType}-${row.targetId}`)}
                            onTargetTypeChange={updateTargetType}
                            onTargetChange={updateTarget}
                            onTokenChange={updateToken}
                            onEnabledChange={updateEnabled}
                            onEdit={editRow}
                            onSave={saveToken}
                            onRemove={removeRow}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}