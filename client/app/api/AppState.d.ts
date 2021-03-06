interface AppState {
    killer: Stage;
    stages: Stage[],
    bonus: Stage
}

interface FullAppState {
    appState: AppState,

    intro?: string;

    stagesNames: {
        [stageId: string]: string
    }
}

interface HasId {
    id: number
}

interface Stage {
    id: string
    status: StageStatus,
    showNumber: number,
    last?: boolean,
    closedTime?: string,
    expectedClosedTime?: string
    questAnswers?: {
        [id: number]: QuestAnswer
    }

    teamBonuses?: {
        [id: number]: QuestAnswer
    }
}

interface QuestAnswer extends HasId {
    answer: string
}

interface QuestTexts {
    stageId: string,
    stageDescription?: string,
    bonuses?: Quest[],
    quests: Quest[]
}

interface Quest extends HasId {
    text: string,
    stageName?: string
    values?: string[]
    type?: QuestType
}

interface AppStateRequest {
    token: string
}

interface FullAppStateResponse {
    state?: FullAppState,
    success: boolean,
    error?: boolean
}


declare const enum StageStatus {
    LOCKED,
    OPEN,
    COMPLETED,
    BONUS,
    BONUS_COMPLETED,
    INTRO,
    KILLER,
    KILLER_COMPLETED
}

interface Team extends TeamSimple {
    firstLoginDate?: Date,
    endQuestDate?: Date,
}

interface TeamSimple {
    name: string,
    secretCode: string,
    tokenId: string,
    startFromStage: number,

    admin?: boolean
}


interface CompleteStageResponse {
    res?: AppState,
    success: boolean,
    error?: boolean
}

declare const enum ActionState {
    NO,
    SAVED,
    ERROR,
    TIMEOUT
}

interface GetRestTimeRequest {
    token: string
}

interface GetRestTimeResponse {
    success: boolean,
    restTimeInSeconds?: string
    isCompleted?: boolean
}

interface AWSSendFileRequest {
    url: string
    sign: string
    file
}

interface AWSSendFileResponse {
    success: boolean
    url?: string,
}

interface GetAWSSignRequest {
    token: string,
    fileName: string,
    type: string,
    fileType: string,
    stageId: string,
    questId: number
}

interface GetAWSSignResponse {
    url?: string,
    sign?: string,
    success: boolean
}