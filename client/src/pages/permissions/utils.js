export const UNASSIGNED_DEPARTMENT = 'Unassigned';
export const ALL_FILTER = 'all';

export function normalizeDepartment(department) {
    return department?.trim() || UNASSIGNED_DEPARTMENT;
}

export function isDraftRow(row) {
    return Boolean(row?.isDraft);
}

export function createDraftRow(teamId) {
    const randomSuffix = Math.random().toString(36).slice(2, 10);
    return {
        _id: `draft-${Date.now()}-${randomSuffix}`,
        teamId,
        teamName: teamId,
        department: '',
        members: [],
        enabled: true,
        isDraft: true
    };
}

export function toStoredMember(member) {
    return {
        id: member.id,
        displayName: member.displayName,
        mail: member.mail || null,
        userPrincipalName: member.userPrincipalName || null
    };
}

export function toStoredMembers(members) {
    return members
        .filter(member => member.id && member.displayName)
        .map(toStoredMember);
}

export function sortByName(members) {
    return [...members].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function filterMembersByDepartment(members, department) {
    const target = normalizeDepartment(department);
    return sortByName(members.filter(member => member.department === target));
}

export function getMemberSearchText(row) {
    return (row.members || [])
        .map(member => [member.displayName, member.mail, member.userPrincipalName].filter(Boolean).join(' '))
        .join(' ');
}

export async function getErrorMessage(response, fallbackMessage) {
    try {
        const data = await response.clone().json();
        if (data.error) return data.error;
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            return data.errors
                .map(error => error.msg || error.message)
                .filter(Boolean)
                .join(', ') || fallbackMessage;
        }
    } catch { }

    return fallbackMessage;
}
