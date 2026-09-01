import { memo, useMemo } from 'react';
import {
    Button, Dropdown, Option, Switch, Text, Tooltip
} from '@fluentui/react-components';
import { Delete24Regular } from '@fluentui/react-icons';
import { MembersDropdown } from './MembersDropdown';
import { usePermissionsStyles } from './styles';
import { filterMembersByDepartment, isDraftRow, normalizeDepartment } from './utils';

function PermissionRowBase({
    row,
    members,
    departments,
    isSaving,
    assignedDepartments,
    onDepartmentChange,
    onMemberToggle,
    onEnabledChange,
    onDelete
}) {
    const styles = usePermissionsStyles();
    const isDraft = isDraftRow(row);
    const department = row.department ? normalizeDepartment(row.department) : '';

    const departmentMembers = useMemo(() => (
        department ? filterMembersByDepartment(members, department) : []
    ), [members, department]);

    return (
        <div className={styles.tableRow} role="row">
            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Department</Text>
                <Dropdown
                    className={styles.departmentDropdown}
                    placeholder="Select department"
                    value={department}
                    selectedOptions={department ? [department] : []}
                    disabled={isSaving}
                    onOptionSelect={(_, data) => onDepartmentChange(row, data.optionValue)}
                >
                    {departments.map((option) => (
                        <Option
                            key={option}
                            value={option}
                            disabled={option !== department && assignedDepartments.has(option)}
                        >
                            {option}
                        </Option>
                    ))}
                </Dropdown>
            </div>

            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Members</Text>
                <MembersDropdown
                    members={departmentMembers}
                    selectedMembers={row.members || []}
                    disabled={isSaving || isDraft}
                    onToggle={(member, checked) => onMemberToggle(row, member, checked)}
                />
            </div>

            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Status</Text>
                <div className={styles.status}>
                    <Switch
                        checked={row.enabled}
                        disabled={isSaving || isDraft}
                        onChange={(_, data) => onEnabledChange(row, data.checked)}
                    />
                    <Text>{row.enabled ? 'Active' : 'Inactive'}</Text>
                </div>
            </div>

            <div className={styles.cell} role="cell">
                <Text className={styles.cellLabel} size={200} weight="semibold">Actions</Text>
                <div className={styles.actions}>
                    <Tooltip
                        content={isDraft ? 'Remove new permission row' : `Delete ${department} permission row`}
                        relationship="label"
                        withArrow
                    >
                        <Button
                            size="small"
                            icon={<Delete24Regular />}
                            disabled={isSaving}
                            aria-label={isDraft ? 'Remove new permission row' : `Delete ${department} permission row`}
                            onClick={() => onDelete(row)}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export const PermissionRow = memo(PermissionRowBase);
