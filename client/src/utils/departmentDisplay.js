const DEPARTMENT_ALIASES = {
    edi: 'EDX'
};

export function getDepartmentDisplayName(department) {
    const displayName = department?.trim() || '';
    return DEPARTMENT_ALIASES[displayName.toLowerCase()] || displayName;
}