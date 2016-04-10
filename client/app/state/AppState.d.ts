interface AppState {
    stages:Stage[]
}

interface HasId {
    id:number
}

interface Stage extends HasId {
    status:StageStatus
    name:string
    questAnswers?:{
        [id:number]:QuestAnswer
    }

}

interface QuestAnswer extends HasId {
    answer:string
}

interface QuestTexts {
    stageId:number
    quests:Quest[]
}

interface Quest extends HasId {
    text:string
}

interface AppStateRequest {
    token:string
}

interface AppStateResponse {
    state?:AppState,
    success:boolean
}

declare const enum StageStatus {
    LOCKED,
    OPEN,
    COMPLETED,
    BONUS
}
