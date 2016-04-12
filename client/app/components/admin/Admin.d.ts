interface GetTeamsRequest {
    token:string
}

interface TeamInfo {
    team:TeamSimple,
    firstLoginDateEkbTimezone?:string,
    endQuestEkbTimezone?:string,
    appState:AppState
}

interface GetTeamsResponse {
    teams?:TeamInfo[],
    success:boolean
}

interface AddTeamRequest {
    token:string
    teamName:string
}

interface AddTeamResponse {
    success:boolean
}