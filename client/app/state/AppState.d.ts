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
    showNumber:number,
    last?:boolean
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

interface Team extends TeamSimple {
    firstLoginDate?:Date,
    endQuestDate?:Date,
}

interface TeamSimple {
    name:string,
    secretCode:string,
    tokenId:string,
    startFromStage:number,

    admin?:boolean
}


interface CompleteStageResponse {
    res:AppState,
    success:boolean
}

declare const enum ActionState {
    NO,
    SAVED,
    ERROR,
    TIMEOUT
}

interface GetRestTimeRequest {
    token:string
}

interface GetRestTimeResponse {
    success:boolean,
    restTimeInSeconds?:string
    isCompleted?:boolean
}

