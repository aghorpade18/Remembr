import { Dropdown, Option, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
    dropdown: {
        minWidth: '240px',
        maxWidth: '360px',
        width: '100%',
        '@media (max-width: 600px)': { minWidth: '100%', maxWidth: '100%' }
    }
});

export function DepartmentPicker({ departments, value, onChange, placeholder = 'Select department', disabled }) {
    const styles = useStyles();
    const empty = !departments || departments.length === 0;

    return (
        <Dropdown
            className={styles.dropdown}
            placeholder={empty ? 'No departments available' : placeholder}
            value={value || ''}
            selectedOptions={value ? [value] : []}
            disabled={disabled || empty}
            onOptionSelect={(_, data) => data.optionValue && onChange(data.optionValue)}
        >
            {(departments || []).map((option) => (
                <Option key={option} value={option}>{option}</Option>
            ))}
        </Dropdown>
    );
}
