interface GetTeamsRequest {
    token:string
}

interface TeamInfo {
    team:Team,
    appState:AppState
}

interface GetTeamsResponse {
    teams?:TeamInfo[],
    success:boolean
}