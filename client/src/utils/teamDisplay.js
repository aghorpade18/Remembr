const TEAM_ALIASES = {
    twinnai: 'Team EDX',
    edi: 'EDX'
};

export function getTeamDisplayName(team) {
    const displayName = team?.displayName || '';
    return TEAM_ALIASES[displayName.trim().toLowerCase()] || displayName;
}