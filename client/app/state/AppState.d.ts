interface AppState {
    stages:Stage[],
    bonus:Stage
}

interface FullAppState {
    appState:AppState,

    stagesNames:{
        [stageId:string]:string
    }
}

interface HasId {
    id:number
}

interface Stage {
    id:string
    status:StageStatus,
    showNumber:number
    questAnswers?:{
        [id:number]:QuestAnswer
    }

}

interface QuestAnswer extends HasId {
    answer:string
}

interface QuestTexts {
    stageId:string
    quests:Quest[]
}

interface Quest extends HasId {
    text:string
}

interface AppStateRequest {
    token:string
}

interface FullAppStateResponse {
    state?:FullAppState,
    success:boolean
}


declare const enum StageStatus {
    LOCKED,
    OPEN,
    COMPLETED,
    BONUS
}

interface Team {
    name:string,
    secretCode:string,
    tokenId:string,
    startFromStage:number,
    firstLoginDate?:Date,
    endQuestDate?:Date,
    admin?:boolean
}
