interface AnswersUpdateRequest {
    token:string,
    stageId:number;
    answers:QuestAnswer[]
}

interface AnswersUpdateResponse {
    success:boolean
}