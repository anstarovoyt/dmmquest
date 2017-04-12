interface TeamsRequest {
    token: string
}

interface RemoveTeamRequest {
    token: string,
    teamTokenId: string
}

interface RemoveTeamResponse {
    success: boolean
}

interface TeamInfo {
    team: TeamSimple,
    firstLoginDateEkbTimezone?: string,
    endQuestEkbTimezone?: string,
    appState: AppState
}

interface TeamsResponse {
    teams?: TeamInfo[],
    success: boolean
}

interface AddTeamRequest {
    token: string
    teamName: string
}

interface AddTeamResponse {
    success: boolean
}

interface UnlockLastCompletedStageRequest {
    token: string,
    teamTokenId: string
}

interface UnlockLastCompletedStageResponse {
    success: boolean
}