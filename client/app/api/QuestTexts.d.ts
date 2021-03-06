interface QuestTextsRequest {
    token: string
    stageId: string
}

declare const enum QuestType {
    TEXT,
    TEXT_NO_TEAM_BONUS,
    UPLOAD,
    UPLOAD_5,
    LIST_BOX
}

interface QuestTextsResponse {
    success: boolean
    questTexts?: QuestTexts
}

type ProcessQuestTexts = (res: { success: boolean; texts: QuestTexts }) => void;