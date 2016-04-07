interface AppState {
    stages:Stage[]
}

interface HasId {
    id:number
}

interface Stage extends HasId {
    isBonus?:boolean
    isOpen?:boolean
    isCompleted?:boolean
    isLocked?:boolean
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