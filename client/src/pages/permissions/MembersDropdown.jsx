import { memo } from 'react';
import {
    Button, Checkbox, Popover, PopoverSurface, PopoverTrigger
} from '@fluentui/react-components';
import { People24Regular } from '@fluentui/react-icons';
import { usePermissionsStyles } from './styles';

function MembersDropdownBase({ members, selectedMembers, disabled, onToggle }) {
    const styles = usePermissionsStyles();
    const selectedIds = new Set(selectedMembers.map((member) => member.id));
    const checkedCount = selectedIds.size;

    const label = members.length === 0
        ? 'No members'
        : checkedCount === members.length
            ? `All ${members.length} members`
            : `${checkedCount} of ${members.length} members`;

    return (
        <Popover positioning="below-start">
            <PopoverTrigger disableButtonEnhancement>
                <Button
                    className={styles.membersButton}
                    icon={<People24Regular />}
                    disabled={disabled || members.length === 0}
                >
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverSurface>
                <div className={styles.memberList}>
                    {members.map((member) => (
                        <Checkbox
                            key={member.id}
                            checked={selectedIds.has(member.id)}
                            label={member.displayName}
                            onChange={(_, data) => onToggle(member, data.checked)}
                        />
                    ))}
                </div>
            </PopoverSurface>
        </Popover>
    );
}

export const MembersDropdown = memo(MembersDropdownBase);
