interface QuestTextsRequest {
	token: string
	stageId: number
}

interface QuestTextsResponse {
	success: boolean
	questTexts?: QuestTexts
}

type ProcessQuestTexts = (req: QuestTexts) => void;