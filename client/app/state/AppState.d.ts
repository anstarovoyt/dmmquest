interface AppState {
	stages: Stage[]
}

interface HasId {
	id: string
}

interface Stage extends HasId {
	isBonus?: boolean
	isOpen?: boolean
	isCompleted?: boolean
	questAnswers?: QuestAnswer[]

}

interface QuestAnswer extends HasId {
	id: string
	answer: string
}

interface QuestTexts {
	stageId: string
	quests: Quest[]
}

interface Quest extends HasId {
	id: string
	text: string
}

