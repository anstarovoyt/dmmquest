interface QuestTextsRequest {
	token: string
	stageId: string
}

interface QuestTextsResponse {
	success: boolean
	questTexts?: QuestTexts
}

type ProcessQuestTexts = (req: QuestTexts) => void;