interface AnswersUpdateRequest {
    token:string,
    stageId:string;
    answers:QuestAnswer[]
}

interface AnswersUpdateResponse {
    success:boolean,
    stage?:Stage
}