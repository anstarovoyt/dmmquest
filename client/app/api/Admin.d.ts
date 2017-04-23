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
    stagePenalties?: { [stageId: string]: number } //stage -> penalty points
    team: TeamSimple,
    firstLoginDateEkbTimezone?: string,
    endQuestEkbTimezone?: string,
    appState: AppState,
    stagesInfo: FullStagesInfo
}

interface FullStagesInfo {
    [stageId: string]: FullStageInfo
}

interface FullStageInfo {
    realName: string,
    questsAnswer?: FullQuestAnswer[]
}

interface FullQuestAnswer {
    type?: QuestType,
    answers: string[]
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
    teamTokenId: string,
    stageId?: string
}

interface UnlockLastCompletedStageResponse {
    success: boolean
}