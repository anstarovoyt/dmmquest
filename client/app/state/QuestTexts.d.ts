interface RequestQuestTexts {
	token: string
	stageId: string
}

interface ResponseQuestTexts {
	success: boolean
	questTexts?: QuestTexts
}

type ProcessQuestTexts = (req: QuestTexts) => void;