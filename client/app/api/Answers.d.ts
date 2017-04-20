interface AnswersUpdateRequest {
    token:string,
    stageId:string;
    answers?:QuestAnswer[]
    teamBonuses?:QuestAnswer[]
}

interface AnswersUpdateResponse {
    success:boolean,
    stage?:Stage
}