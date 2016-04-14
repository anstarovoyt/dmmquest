interface QuestTextsRequest {
    token:string
    stageId:string
}

interface QuestTextsResponse {
    success:boolean
    questTexts?:QuestTexts
}

type ProcessQuestTexts = (res:{success:boolean; texts:QuestTexts})=>void;