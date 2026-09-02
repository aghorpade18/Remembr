import { memo } from 'react';
import { Button, Dropdown, Input, Option, Switch, Text } from '@fluentui/react-components';
import { Delete24Regular, Edit24Regular, Save24Regular } from '@fluentui/react-icons';
import { useTeamTokensStyles } from './styles';

export const TYPE_LABELS = {
    channel: 'Channel',
    groupchat: 'Group chat'
};

function TeamTokenRowBase({
    row,
    targets,
    saving,
    onTargetTypeChange,
    onTargetChange,
    onTokenChange,
    onEnabledChange,
    onEdit,
    onSave,
    onRemove
}) {
    const styles = useTeamTokensStyles();
    const rowLabel = `${TYPE_LABELS[row.targetType] || row.targetType} ${row.targetName}`;
    const targetOptions = targets[row.targetType] || [];
    const editing = row.isDraft || row.isEditing || row.dirty;

    return (
        <div className={styles.tableRow} role="row">
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Type</Text>
                {editing ? (
                    <Dropdown
                        className={styles.typeDropdown}
                        value={TYPE_LABELS[row.targetType] || ''}
                        selectedOptions={row.targetType ? [row.targetType] : []}
                        disabled={saving}
                        onOptionSelect={(_, data) => onTargetTypeChange(row, data.optionValue)}
                    >
                        <Option value="channel">Channel</Option>
                        <Option value="groupchat">Group chat</Option>
                    </Dropdown>
                ) : (
                    <Text className={styles.readValue}>{TYPE_LABELS[row.targetType] || row.targetType}</Text>
                )}
            </div>
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Group name</Text>
                {editing ? (
                    <Dropdown
                        className={styles.nameDropdown}
                        placeholder={row.targetType === 'groupchat' ? 'Select group chat' : 'Select channel'}
                        value={row.targetName || ''}
                        selectedOptions={row.targetId ? [row.targetId] : []}
                        disabled={saving || targetOptions.length === 0}
                        onOptionSelect={(_, data) => onTargetChange(row, data.optionValue)}
                    >
                        {targetOptions.map((target) => (
                            <Option key={target.id} value={target.id}>{target.displayName}</Option>
                        ))}
                    </Dropdown>
                ) : (
                    <Text className={styles.readValue}>{row.targetName || '-'}</Text>
                )}
            </div>
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Token usage</Text>
                {editing ? (
                    <Input
                        className={styles.tokenInput}
                        type="text"
                        value={row.token === undefined || row.token === null ? '' : String(row.token)}
                        disabled={saving}
                        placeholder="e.g. 2000k"
                        aria-label={`Token usage for ${rowLabel}`}
                        onChange={(_, data) => onTokenChange(row, data.value)}
                    />
                ) : (
                    <Text className={styles.readValue}>{row.token || '-'}</Text>
                )}
            </div>
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Status</Text>
                {editing ? (
                    <div className={styles.status}>
                        <Switch
                            checked={row.enabled !== false}
                            disabled={saving}
                            onChange={(_, data) => onEnabledChange(row, data.checked)}
                        />
                        <Text>{row.enabled !== false ? 'Enabled' : 'Disabled'}</Text>
                    </div>
                ) : (
                    <Text className={row.enabled !== false ? styles.enabledValue : styles.disabledValue}>
                        {row.enabled !== false ? 'Enabled' : 'Disabled'}
                    </Text>
                )}
            </div>
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Actions</Text>
                <div className={styles.actions}>
                    {editing ? (
                        <Button
                            appearance="primary"
                            size="small"
                            icon={<Save24Regular />}
                            aria-label={saving ? `Saving ${rowLabel}` : `Save ${rowLabel}`}
                            disabled={saving || !row.dirty || !row.targetId}
                            onClick={() => onSave(row)}
                        />
                    ) : (
                        <Button
                            size="small"
                            icon={<Edit24Regular />}
                            aria-label={`Edit ${rowLabel}`}
                            onClick={() => onEdit(row)}
                        />
                    )}
                    <Button
                        size="small"
                        icon={<Delete24Regular />}
                        disabled={saving}
                        aria-label={`Remove ${rowLabel}`}
                        onClick={() => onRemove(row)}
                    />
                </div>
            </div>
        </div>
    );
}

export const TeamTokenRow = memo(TeamTokenRowBase);